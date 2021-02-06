import {ChangeDetectionStrategy, Component} from '@angular/core';
import {BondsService} from '../../../../core/services/bonds.service';
import {ActivatedRoute} from '@angular/router';
import {map, pluck, shareReplay} from 'rxjs/operators';
import {combineLatest} from 'rxjs/internal/observable/combineLatest';
import {Bond, IProviderUserInfo, TokenSymbol} from '../../../../core/models/types';
import {ConnectorService} from '../../../../core/services/connector.service';
import {UiUtils} from '../../../../shared/utils/ui.utils';
import {ApiService} from '../../../../core/services/api.service';
import {switchMap} from 'rxjs/internal/operators/switchMap';
import {DateTimeUtil} from '../../../../shared/utils/date-time.util';
import Web3 from 'web3';
import {abi as erc20Abi} from '@uniswap/v2-core/build/IUniswapV2ERC20.json';
import {TokenUtil} from '../../../../shared/utils/token.util';
import {interval} from 'rxjs';
import {tap} from 'rxjs/internal/operators/tap';

@Component({
  selector: 'app-bond',
  templateUrl: './bond.page.html',
  styleUrls: ['./bond.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BondPage {

  stakeAmount: string;

  UiUtils = UiUtils;
  DateTimeUtil = DateTimeUtil;
  now = new Date();
  private millisPerYear = 1000 * 60 * 60 * 24 * 365;

  bond$ = combineLatest([this.bondsService.bondsList$, this.route.params.pipe(pluck('id'))]).pipe(
    map(([bonds, id]: [Bond[], string]) => bonds.find(b => b.id.toString() === id)),
    shareReplay(1)
  );

  stakeTokenBalance$ = combineLatest([this.bond$, this.connectorService.providerUserInfo$]).pipe(
    switchMap(([bond, info]: [Bond, IProviderUserInfo]) => this.apiService.getTokenBalance$(info.address, bond.stake as TokenSymbol)),
    shareReplay(1)
  );

  stakedBalance$ = combineLatest([this.connectorService.web3$, this.bond$, this.connectorService.providerUserInfo$]).pipe(
    switchMap(([web3, bond, info]: [Web3, Bond, IProviderUserInfo]) => this.getBalanceOf(
      web3, bond, info.address)),
    shareReplay(1)
  );
  stakedBalanceCurrentReturn$ = interval(1000).pipe(
    tap(v => console.log('TTTT')),
    switchMap(_ => combineLatest([this.bond$, this.stakedBalance$]).pipe(
      map(([bond, balance]: [Bond, string]) => {
        const yearlyReturnTotal = (parseFloat(bond.apy) / 100) * parseFloat(balance);
        const startT = (DateTimeUtil.toDate(bond.farmStartTime)).getTime();
        const endT = (DateTimeUtil.toDate(bond.farmEndTime)).getTime();
        const secDiff = endT - startT;
        const yearlyFarmDurationTimeRel = secDiff / this.millisPerYear;
        const farmReturnTotal = yearlyReturnTotal * yearlyFarmDurationTimeRel;
        const farmRelTimeElapsed = (this.now.getTime() - startT) / secDiff;
        console.log('fa VVV=', farmRelTimeElapsed);
        return farmReturnTotal * farmRelTimeElapsed;
      })
    )),
    shareReplay(1)
  )

  ;

  private getBalanceOf(web3: Web3, bond: Bond, balanceForAddress: string) {
    console.log('getBalanceOf !!! REMOVE mock');
    return Promise.resolve('1000');
    const contract = new web3.eth.Contract(erc20Abi as any, bond.bondContractAddress);
    return contract.methods.balanceOf(balanceForAddress)
      .call()
      .then((balance) => {
        return TokenUtil.toDisplayDecimalValue(balance, bond.farm as TokenSymbol);
      }) as Promise<string>;
  }


  constructor(
    private route: ActivatedRoute,
    private bondsService: BondsService,
    public connectorService: ConnectorService,
    public apiService: ApiService) {
  }

  getBonds(bond: Bond, stakeAmount: string) {

  }
}
