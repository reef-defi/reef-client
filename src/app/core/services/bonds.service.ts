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
      'bondContractAddress': '',

      'stake': 'REEF',
      'stakeTokenAddress': '',
      'stakeTokenLogo': 'http://localhost:4200/assets/images/reef/reef-token.svg',
      'stakeDecimals': 0,
      'farm': 'REEF',
      'farmTokenAddress': '',
      'farmTokenLogo': 'http://localhost:4200/assets/images/reef/reef-token.svg',
      'farmStartTime': '2021-02-08T15:00:00.000Z',
      'farmEndTime': '2022-02-07T23:00:00.000Z',
      'farmDecimals': 0,
      'entryStartTime': '2021-02-08T12:00:00.000Z',
      'entryEndTime': '2021-02-08T15:00:00.000Z',
      'apy': '40'
    }]
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
