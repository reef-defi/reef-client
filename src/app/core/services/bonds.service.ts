import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Bond, TokenSymbol} from '../models/types';
import {of} from 'rxjs/internal/observable/of';
import {TokenUtil} from '../../shared/utils/token.util';
import {abi as erc20Abi} from '@uniswap/v2-core/build/IUniswapV2ERC20.json';
import {ConnectorService} from './connector.service';
import {switchMap} from 'rxjs/internal/operators/switchMap';
import {environment} from '../../../environments/environment';
import {shareReplay} from 'rxjs/operators';
import {tap} from 'rxjs/internal/operators/tap';

@Injectable({
  providedIn: 'root',
})
export class BondsService {
  public bondsList$: Observable<Bond[]> = of([
    /*{
      'id': 1,
      'bondName': 'Shell',
      'bondDescription': '',
      'bondContractAddress': '',

      'stake': 'REEF',
      'stakeTokenAddress': '',
      'stakeTokenLogo': 'http://localhost:4200/assets/images/reef/reef-token.svg',
      'stakeDecimals': false,
      'farm': 'REEF',
      'farmTokenAddress': '',
      'farmTokenLogo': 'http://localhost:4200/assets/images/reef/reef-token.svg',
      'farmStartTime': 'Mon Feb 08 2021 00:13:58 GMT+0100 (Central European Standard Time)',
      'farmEndTime': 'Mon Feb 08 2022 00:13:58 GMT+0100 (Central European Standard Time)',
      'farmDecimals': 1,
      'entryExpirationTime': 'Mon Feb 08 2021 00:19:58 GMT+0100 (Central European Standard Time)',
      'apy': '40'
    } as Bond*/
    {
      id: 1,
      bondName: 'Shell',
      bondDescription: '',
      stake: 'REEF',
      stakeTokenAddress: '',
      stakeTokenLogo: 'http://localhost:4200/assets/images/reef/reef-token.svg',
      stakeDecimals: false,
      farm: 'REEF',
      farmTokenAddress: '',
      farmTokenLogo: 'http://localhost:4200/assets/images/reef/reef-token.svg',
      farmStartTime: new Date(
        new Date().getTime() - 1000 * 60 * 60 * 24 * 365
      ).toString(),
      farmEndTime: new Date(
        new Date().getTime() + 1000 * 60 * 60 * 24 * 365
      ).toString(),
      farmDecimals: 1,
      entryExpirationTime: new Date(
        new Date().getTime() + 1000 * 10
      ).toString(),
      apy: '40',
      // lockDurationText: '1 year',
      bondContractAddress: '',
    } as Bond,
  ]);

  public bondsList_$: Observable<Bond[]> = this.http
    .get(environment.reefNodeApiUrl + '/bonds')
    .pipe(
      tap((v) => console.log('BBB=', v)),
      shareReplay(1)
    ) as Observable<Bond[]>;

  constructor(
    private http: HttpClient,
    private connectorService: ConnectorService
  ) {
  }

  getStakedBalanceOf(
    bond: Bond,
    balanceForAddress: string
  ): Observable<string> {
    console.log('getBalanceOf !!! REMOVE mock');
    return of('1000');
    return this.connectorService.web3$.pipe(
      switchMap((web3) => {
        const contract = new web3.eth.Contract(
          erc20Abi as any,
          bond.bondContractAddress
        );
        return contract.methods
          .balanceOf(balanceForAddress)
          .call()
          .then((balance) => {
            return TokenUtil.toDisplayDecimalValue(
              balance,
              bond.farm as TokenSymbol
            );
          });
      })
    ) as Observable<string>;
  }
}
