import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, Observable } from 'rxjs';
import {
  Bond,
  BondSaleStatus,
  ProtocolAddresses,
  TokenSymbol,
  TransactionType,
} from '../models/types';
import { TokenUtil } from '../../shared/utils/token.util';
import { ConnectorService } from './connector.service';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { environment } from '../../../environments/environment';
import { map, shareReplay } from 'rxjs/operators';
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

@Injectable({
  providedIn: 'root',
})
export class BondsService {
  public bondsList$: Observable<
    Bond[]
  > = this.connectorService.providerUserInfo$.pipe(
    switchMap((info) =>
      this.http.get(environment.reefNodeApiUrl + '/bonds', {
        params: { chainId: info.chainInfo.chain_id.toString() },
      })
    ),
    shareReplay(1)
  ) as Observable<Bond[]>;

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

  constructor(
    private http: HttpClient,
    private connectorService: ConnectorService,
    private uniswapService: UniswapService,
    private notificationService: NotificationService,
    private apiService: ApiService,
    private transactionsService: TransactionsService
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

  getBondTimeValues$(bond: Bond): Observable<Bond> {
    if (!this.bondTimeValues.has(bond.id)) {
      const bTimeValues$ = this.connectorService.web3$.pipe(
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
              bond.entryStartTime = eStart;
              bond.entryEndTime = DateTimeUtil.toJSTimestamp(eEnd);
              bond.farmStartTime = DateTimeUtil.toJSTimestamp(fStart);
              bond.farmEndTime = DateTimeUtil.toJSTimestamp(fEnd);
              return bond;
            })
          ) as Observable<Bond>;
        }),
        shareReplay(1)
      );
      this.bondTimeValues.set(bond.id, bTimeValues$);
    }
    return this.bondTimeValues.get(bond.id);
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
        this.transactionsService.addPendingTx(hash, TransactionType.REEF_BOND, [bond.stake as TokenSymbol, bond.farm as TokenSymbol]);
      })
      .on('receipt', (receipt) => {
        this.transactionsService.removePendingTx(receipt.transactionHash);
        this.notificationService.showNotification(
          `Locked ${amount} ${bond.stake}`,
          'Okay',
          'success'
        );
        this.apiService.updateTokensInBalances.next([
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

  toBondSaleStatus(bond: Bond): BondSaleStatus {
    if (bond.stakeMaxAmountReached) {
      return BondSaleStatus.FILLED;
    }
    const now = new Date();
    if (
      !!bond.entryStartTime &&
      DateTimeUtil.toDate(bond.entryStartTime) > now
    ) {
      return BondSaleStatus.EARLY;
    }
    if (!!bond.entryEndTime && DateTimeUtil.toDate(bond.entryEndTime) > now) {
      return BondSaleStatus.OPEN;
    }
    return BondSaleStatus.LATE;
  }
}
