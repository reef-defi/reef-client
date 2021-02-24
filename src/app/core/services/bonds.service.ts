import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, Observable, Subject, timer } from 'rxjs';
import {
  Bond,
  BondSaleStatus,
  BondTimes,
  ChainId,
  IProviderUserInfo,
  ProtocolAddresses,
  TokenSymbol,
  TransactionType,
} from '../models/types';
import { TokenUtil } from '../../shared/utils/token.util';
import { ConnectorService } from './connector.service';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { environment } from '../../../environments/environment';
import { map, shareReplay, takeWhile } from 'rxjs/operators';
import { getContractData } from '../../../assets/abi';
import { UniswapService } from './uniswap.service';
import { first } from 'rxjs/internal/operators/first';
import { ErrorUtils } from '../../shared/utils/error.utils';
import { NotificationService } from './notification.service';
import { ApiService } from './api.service';
import { TransactionsService } from './transactions.service';
import Web3 from 'web3';
import { of } from 'rxjs/internal/observable/of';
import { combineLatest } from 'rxjs/internal/observable/combineLatest';
import { DateTimeUtil } from '../../shared/utils/date-time.util';
import { TokenBalanceService } from '../../shared/service/token-balance.service';
import { UiUtils } from '../../shared/utils/ui.utils';
import { startWith } from 'rxjs/internal/operators/startWith';
import { BondUtil } from '../../shared/utils/bond.util';

@Injectable({
  providedIn: 'root',
})
export class BondsService {
  public bondsList$: Observable<{
    chainId: number;
    list: Bond[];
  }> = this.connectorService.providerUserInfo$.pipe(
    switchMap(
      (info) =>
        this.http.get(environment.reefNodeApiUrl + '/bonds', {
          params: { chainId: info.chainInfo.chain_id.toString() },
        }),
      (info, res: any) => ({ chainId: info.chainInfo.chain_id, list: res })
    ),
    map((res) => ({
      chainId: res.chainId,
      list: res.list.map((b) => this.attachBondObservables(b)),
    })),
    shareReplay(1)
  ) as Observable<{ chainId: number; list: Bond[] }>;

  private timer$ = timer(0, 1000).pipe(shareReplay(1));

  constructor(
    private http: HttpClient,
    private connectorService: ConnectorService,
    private uniswapService: UniswapService,
    private notificationService: NotificationService,
    private apiService: ApiService,
    private transactionsService: TransactionsService,
    public tokenBalanceService: TokenBalanceService
  ) {}

  getStakedBalanceOf(
    bond: Bond,
    balanceForAddress: string
  ): Observable<string> {
    return this.connectorService.web3$.pipe(
      switchMap((web3) => {
        const reefAbis = getContractData({} as ProtocolAddresses);
        const contract = new web3.eth.Contract(
          reefAbis.reefBond.abi as any,
          bond.bondContractAddress
        );
        return contract.methods
          .balanceOf(balanceForAddress)
          .call()
          .then((balance) => {
            if (!balance) {
              return '0';
            }
            return TokenUtil.toDisplayDecimalValue(
              balance,
              bond.farm as TokenSymbol
            );
          });
      })
    ) as Observable<string>;
  }

  private getBondTimeValues$(bond: Bond): Observable<BondTimes> {
    return this.connectorService.web3$.pipe(
      switchMap((web3: Web3) => {
        const reefAbis = getContractData({} as ProtocolAddresses);
        const bondContract = new web3.eth.Contract(
          reefAbis.reefBond.abi as any,
          bond.bondContractAddress
        );
        const entryStart$ = of(bond.entryStartTime || new Date().getTime());
        const entryEnd$ = from(
          bondContract.methods.windowOfOpportunity().call() as Promise<number>
        ).pipe(shareReplay(1));
        const farmStart$ = bondContract.methods
          .startTime()
          .call() as Promise<number>;
        const farmEnd$ = bondContract.methods
          .releaseTime()
          .call() as Promise<number>;
        return combineLatest([
          entryStart$,
          entryEnd$,
          farmStart$,
          farmEnd$,
        ]).pipe(
          map(([eStart, eEnd, fStart, fEnd]) => {
            const times: any = {};
            times.entryStartTime = eStart;
            times.entryEndTime = DateTimeUtil.toJSTimestamp(eEnd);
            times.farmStartTime = DateTimeUtil.toJSTimestamp(fStart);
            times.farmEndTime = DateTimeUtil.toJSTimestamp(fEnd);
            return times as BondTimes;
          })
        ) as Observable<BondTimes>;
      }),
      shareReplay(1)
    );
  }

  async stake(bond: Bond, amount: string): Promise<void> {
    const amt = parseFloat(amount);
    if (amt && amt <= 0) {
      return Promise.resolve();
    }
    const amtWei = TokenUtil.toContractIntegerBalanceValue(
      amt,
      bond.stake as TokenSymbol
    );

    const info = await this.connectorService.providerUserInfo$
      .pipe(first())
      .toPromise();
    const web3 = await this.connectorService.web3$.pipe(first()).toPromise();
    const reefAbis = getContractData({} as ProtocolAddresses);
    const stakeTokenContract = new web3.eth.Contract(
      reefAbis.erc20Token.abi,
      bond.stakeTokenAddress
    );
    await this.uniswapService.approveToken(
      stakeTokenContract,
      bond.bondContractAddress
    );

    const bondContract = new web3.eth.Contract(
      reefAbis.reefBond.abi,
      bond.bondContractAddress
    );
    return bondContract.methods
      .stake(amtWei)
      .send({
        from: info.address,
        gasPrice: this.connectorService.getGasPrice(info.chainInfo.chain_id),
        gas: 262524,
      })
      .on('transactionHash', (hash) => {
        this.notificationService.showNotification(
          'The transaction is now pending.',
          'Ok',
          'info'
        );
        this.transactionsService.addPendingTx(
          hash,
          TransactionType.REEF_BOND,
          [bond.stake as TokenSymbol, bond.farm as TokenSymbol],
          info.chainInfo.chain_id
        );
      })
      .on('receipt', (receipt) => {
        this.transactionsService.removePendingTx(receipt.transactionHash);
        this.notificationService.showNotification(
          `Locked ${amount} ${bond.stake}`,
          'Okay',
          'success'
        );
        this.tokenBalanceService.updateTokensInBalances.next([
          TokenSymbol.ETH,
          bond.stake as TokenSymbol,
        ]);
      })
      .on('error', (err) => {
        if (
          err.message.indexOf('missed it') > 0 ||
          err.message.indexOf('expired') > 0
        ) {
          this.notificationService.showNotification(
            'Bond offer already closed.',
            'Close',
            'error'
          );
        } else {
          this.notificationService.showNotification(
            ErrorUtils.parseError(err.code),
            'Close',
            'error'
          );
        }
      });
  }

  private getBondStatus$(bondWithTimeObs: Bond): Observable<BondSaleStatus> {
    const status$ = combineLatest([bondWithTimeObs.times$, this.timer$]).pipe(
      map(([bondTimes, _]) =>
        this.toBondSaleStatus(bondWithTimeObs, bondTimes)
      ),
      takeWhile((v) => v !== BondSaleStatus.COMPLETE, true),
      shareReplay(1)
    );
    return status$;
  }

  toBondSaleStatus(bond: Bond, bondTimes: BondTimes): BondSaleStatus {
    if (bond.stakeMaxAmountReached) {
      return BondSaleStatus.FILLED;
    }
    const now = new Date();
    if (
      !!bondTimes.entryStartTime &&
      DateTimeUtil.toDate(bondTimes.entryStartTime) > now
    ) {
      return BondSaleStatus.EARLY;
    }
    if (
      !!bondTimes.entryEndTime &&
      DateTimeUtil.toDate(bondTimes.entryEndTime) > now
    ) {
      return BondSaleStatus.OPEN;
    }
    if (
      !!bondTimes.farmEndTime &&
      DateTimeUtil.toDate(bondTimes.farmEndTime) < now
    ) {
      return BondSaleStatus.COMPLETE;
    }
    return BondSaleStatus.FARM;
  }

  private attachBondObservables(bond: Bond): Bond {
    const bondTimeValues$ = this.getBondTimeValues$(bond);
    bond.times$ = bondTimeValues$;
    bond.entryEndTime$ = bondTimeValues$.pipe(map((btv) => btv.entryEndTime));
    bond.farmDurationTimeDisplayStr$ = bondTimeValues$.pipe(
      map((btv) =>
        UiUtils.toMinTimespanText(btv.farmStartTime, btv.farmEndTime)
      ),
      shareReplay(1)
    );
    bond.status$ = this.getBondStatus$(bond);
    bond.stakedBalanceUpdate = new Subject();
    const stakedBalance$ = combineLatest([
      of(bond),
      bond.times$,
      this.connectorService.providerUserInfo$,
      bond.stakedBalanceUpdate.pipe(startWith(null)),
    ]).pipe(
      switchMap(
        ([bond, bondTimes, info, _]: [
          Bond,
          BondTimes,
          IProviderUserInfo,
          any
        ]) => this.getStakedBalanceOf(bond, info.address),
        (bondInfo, balance) => ({
          bond: bondInfo[0],
          bondTimes: bondInfo[1],
          info: bondInfo[2],
          balance,
        })
      ),
      shareReplay(1)
    );
    bond.stakedBalanceReturn$ = combineLatest([
      stakedBalance$,
      bond.status$,
    ]).pipe(
      map(
        // tslint:disable-next-line:variable-name
        ([bond_times_info_balance, status]: [
          {
            bond: Bond;
            bondTimes: BondTimes;
            info: IProviderUserInfo;
            balance: string;
          },
          BondSaleStatus
        ]) => ({
          bond: bond_times_info_balance.bond,
          status,
          staked: parseFloat(bond_times_info_balance.balance),
          ...BondUtil.getBondReturn(
            bond_times_info_balance.bond,
            bond_times_info_balance.bondTimes,
            bond_times_info_balance.balance
          ),
        })
      ),
      takeWhile(
        (v) =>
          v.status !== BondSaleStatus.COMPLETE || v.totalInterestReturn === 0,
        true
      ),
      shareReplay(1)
    ) as Observable<{
      bond: Bond;
      status: BondSaleStatus;
      staked: number;
      currentInterestReturn: number;
      totalInterestReturn: number;
    }>;

    return bond;
  }
}
