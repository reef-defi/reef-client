import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Bond, ProtocolAddresses, TokenSymbol} from '../models/types';
import {of} from 'rxjs/internal/observable/of';
import {TokenUtil} from '../../shared/utils/token.util';
import {ConnectorService} from './connector.service';
import {switchMap} from 'rxjs/internal/operators/switchMap';
import {environment} from '../../../environments/environment';
import {shareReplay} from 'rxjs/operators';
import {getContractData} from '../../../assets/abi';
import {UniswapService} from './uniswap.service';
import {first} from 'rxjs/internal/operators/first';
import {ErrorUtils} from '../../shared/utils/error.utils';
import {NotificationService} from './notification.service';
import {ApiService} from './api.service';

@Injectable({
  providedIn: 'root',
})
export class BondsService {
  public bondsList_$: Observable<Bond[]> = this.http
    .get(environment.reefNodeApiUrl + '/bonds')
    .pipe(
      shareReplay(1)
    ) as Observable<Bond[]>;

  public bondsList$: Observable<Bond[]> = of(
    [{
      'id': 1,
      'bondName': 'Shell',
      'bondDescription': '',
      'bondContractAddress': '0xc5CFEe75Cc61d2810216E89b4Dc53481DD243338', // local

      'stake': 'REEF',
      'stakeTokenAddress': '0x3F2D78c7F1A20BF14E1f4D249973968146Fb5Ee1',
      'stakeTokenLogo': 'http://localhost:4200/assets/images/reef/reef-token.svg',
      'stakeDecimals': 0,
      'farm': 'REEF',
      'farmTokenAddress': '0x3F2D78c7F1A20BF14E1f4D249973968146Fb5Ee1',
      'farmTokenLogo': 'http://localhost:4200/assets/images/reef/reef-token.svg',
      'farmStartTime': '2021-02-08T15:00:00.000Z',
      'farmEndTime': '2022-02-07T23:00:00.000Z',
      'farmDecimals': 0,
      'entryStartTime': '2021-02-08T12:00:00.000Z',
      'entryEndTime': '2021-02-08T13:00:00.000Z',
      'apy': '40'
    }]
  ) as Observable<Bond[]>;

  constructor(
    private http: HttpClient,
    private connectorService: ConnectorService,
    private uniswapService: UniswapService,
    private notificationService: NotificationService,
    private apiService: ApiService
  ) {
  }

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

  async stake(bond: Bond, amount: string): Promise<void> {
    const amt = parseFloat(amount);
    if (amt && amt <= 0) {
      return Promise.resolve();
    }
    const amtWei = TokenUtil.toContractIntegerBalanceValue(amt, bond.stake as TokenSymbol);
    console.log('stake VVV=', amtWei);

    const info = await this.connectorService.providerUserInfo$.pipe(first()).toPromise();
    const web3 = await this.connectorService.web3$.pipe(first()).toPromise();
    const reefAbis = getContractData({} as ProtocolAddresses);
    const stakeTokenContract = new web3.eth.Contract(
      reefAbis.erc20Token.abi,
      bond.stakeTokenAddress
    );
    console.log('stake VVV=', bond.stakeTokenAddress);

    await this.uniswapService.approveToken(stakeTokenContract, bond.bondContractAddress);

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
        this.connectorService.addPendingTx(hash);
      })
      .on('receipt', (receipt) => {
        this.connectorService.removePendingTx(receipt.transactionHash);
        this.notificationService.showNotification(
          `Locked ${amount} ${bond.stake}`,
          'Okay',
          'success'
        );
        this.apiService.updateTokensInBalances.next([TokenSymbol.ETH, bond.stake as TokenSymbol]);
      })
      .on('error', (err) => {
        this.notificationService.showNotification(
          ErrorUtils.parseError(err.code),
          'Close',
          'error'
        );
      });
  }
}
