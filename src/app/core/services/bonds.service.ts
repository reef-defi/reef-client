import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, Observable, timer } from 'rxjs';
import {
  Bond,
  BondSaleStatus,
  BondTimes, IProviderUserInfo,
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
import {startWith} from 'rxjs/internal/operators/startWith';
import {BondUtil} from '../../shared/utils/bond.util';

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

  private timer$ = timer(0, 1000).pipe();

  /*public bondsList$: Observable<Bond[]> = of([
    {
      id: 1,
      bondName: 'Shell',
      bondDescription: '',
      bondContractAddress: '0xc5CFEe75Cc61d2810216E89b4Dc53481DD243338', // local

      stake: 'REEF',
      stakeTokenAddress: '0x3F2D78c7F1A20BF14E1f4D249973968146Fb5Ee1',
      stakeTokenLogo: 'http://localhost:4200/assets/images/reef/reef-token.svg',
      stakeDecimals: 0,
      farm: 'REEF',
      farmTokenAddress: '0x3F2D78c7F1A20BF14E1f4D249973968146Fb5Ee1',
      farmTokenLogo: 'http://localhost:4200/assets/images/reef/reef-token.svg',
      farmDecimals: 0,
      apy: '40',
    },
  ]) as Observable<Bond[]>;*/
  private bondTimeValues = new Map();
  private bondStatusObservables = new Map<string, Observable<BondSaleStatus>>();

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
    return of('10')
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
            times.entryEndTime = new Date().getTime() + 10000; // DateTimeUtil.toJSTimestamp(eEnd);
            times.farmStartTime = DateTimeUtil.toJSTimestamp(fStart);
            times.farmEndTime = new Date().getTime() + 20000; // DateTimeUtil.toJSTimestamp(fEnd);
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
        gasPrice: this.connectorService.getGasPrice(),
      })
      .on('transactionHash', (hash) => {
        this.notificationService.showNotification(
          'The transaction is now pending.',
          'Ok',
          'info'
        );
        this.transactionsService.addPendingTx(hash, TransactionType.REEF_BOND, [
          bond.stake as TokenSymbol,
          bond.farm as TokenSymbol,
        ]);
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
      takeWhile((v) => v !== BondSaleStatus.LATE, true),
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
    return BondSaleStatus.LATE;
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
  const  stakedBalance$ = combineLatest([
      this.bond$,
      this.bondTimes$,
      this.connectorService.providerUserInfo$,
      this.stakedBalanceUpdate.pipe(startWith(null)),
    ]).pipe(
      switchMap(
        ([bond, bondTimes, info, _]: [Bond, BondTimes, IProviderUserInfo, any]) =>
          this.bondsService.getStakedBalanceOf(bond, info.address),
        (bondInfo, balance) => ({
          bond: bondInfo[0],
          bondTimes: bondInfo[1],
          info: bondInfo[2],
          balance,
        })
      ),
      shareReplay(1)
    );
    const stakedBalanceReturn$ = combineLatest([this.stakedBalance$, this.timer$]).pipe(
      map(
        // tslint:disable-next-line:variable-name
        ([bond_times_info_balance, _]: [
          {
            bond: Bond;
            bondTimes: BondTimes;
            info: IProviderUserInfo;
            balance: string;
          },
          any
        ]) => ({
          bond: bond_times_info_balance.bond,
          staked: parseFloat(bond_times_info_balance.balance),
          ...BondUtil.getBondReturn(
            bond_times_info_balance.bond,
            bond_times_info_balance.bondTimes,
            bond_times_info_balance.balance
          ),
          // totalInterestReturn: (parseFloat(bond_info_balance.bond.apy) / 100) * parseFloat(bond_info_balance.balance)
        })
      ),
      shareReplay(1)
    ) as Observable<{
      bond: Bond;
      staked: number;
      currentInterestReturn: number;
      totalInterestReturn: number;
    }>;
    const timeLeftToExpired$ = combineLatest([this.bondTimes$, this.timer$]).pipe(
      map(([bond, _]) => {
        const now = new Date();
        if (
          !!bond.entryStartTime &&
          DateTimeUtil.toDate(bond.entryStartTime) > now
        ) {
          return null;
        }
        return DateTimeUtil.getPositiveTimeDiff(now, bond.entryEndTime);
      })
    );
    bond.timeLeftToExpired$
    return bond;
  }
}
