import {ChangeDetectionStrategy, Component} from '@angular/core';
import {BondsService} from '../../../../core/services/bonds.service';
import {ActivatedRoute} from '@angular/router';
import {map, pluck, shareReplay} from 'rxjs/operators';
import {combineLatest} from 'rxjs/internal/observable/combineLatest';
import {Bond, IProviderUserInfo, TokenSymbol,} from '../../../../core/models/types';
import {ConnectorService} from '../../../../core/services/connector.service';
import {UiUtils} from '../../../../shared/utils/ui.utils';
import {ApiService} from '../../../../core/services/api.service';
import {switchMap} from 'rxjs/internal/operators/switchMap';
import {DateTimeUtil} from '../../../../shared/utils/date-time.util';
import {TokenUtil} from '../../../../shared/utils/token.util';
import {Observable, timer} from 'rxjs';
import {BondUtil} from '../../../../shared/utils/bond.util';


let timer$ = timer(0, 1000);

@Component({
  selector: 'app-bond',
  templateUrl: './bond.page.html',
  styleUrls: ['./bond.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BondPage {
  stakeAmount: string;

  UiUtils = UiUtils;
  DateTimeUtil = DateTimeUtil;
  BondUtil = BondUtil;
  TokenUtil = TokenUtil;

  bond$ = combineLatest([
    this.bondsService.bondsList$,
    this.route.params.pipe(pluck('id')),
  ]).pipe(
    map(([bonds, id]: [Bond[], string]) =>
      bonds.find((b) => b.id.toString() === id)
    ),
    shareReplay(1)
  );

  stakeTokenBalance$ = combineLatest([
    this.bond$,
    this.connectorService.providerUserInfo$,
  ]).pipe(
    switchMap(([bond, info]: [Bond, IProviderUserInfo]) =>
      this.apiService.getTokenBalance$(info.address, bond.stake as TokenSymbol)
    ),
    shareReplay(1)
  );

  private stakedBalance$ = combineLatest([
    this.bond$,
    this.connectorService.providerUserInfo$,
  ]).pipe(
    switchMap(([bond, info]: [Bond, IProviderUserInfo]) =>
        this.bondsService.getStakedBalanceOf(bond, info.address),
      (bondInfo, balance
      ) => ({bond: bondInfo[0], info: bondInfo[1], balance})),
    shareReplay(1)
  );
  stakedBalanceReturn$ = combineLatest([this.stakedBalance$, timer$]).pipe(
    // tslint:disable-next-line:variable-name
    map(([bond_info_balance, tmr]: [{ bond: Bond, info: IProviderUserInfo, balance: string }, any]
    ) => ({
      bond: bond_info_balance.bond,
      staked: parseFloat(bond_info_balance.balance),
      ...BondUtil.getBondReturn(bond_info_balance.bond, bond_info_balance.balance)
      // totalInterestReturn: (parseFloat(bond_info_balance.bond.apy) / 100) * parseFloat(bond_info_balance.balance)
    })),
    shareReplay(1)
  ) as Observable<{ bond: Bond, staked: number, currentInterestReturn: number, totalInterestReturn: number }>;
  timeLeftToExpired$ = combineLatest([this.bond$, timer$]).pipe(
    map(([bond, _]: [Bond, any]) => DateTimeUtil.getTimeDiff(new Date(), bond.entryExpirationTime))
  );

  constructor(
    private route: ActivatedRoute,
    private bondsService: BondsService,
    public connectorService: ConnectorService,
    public apiService: ApiService
  ) {
  }

  getBonds(bond: Bond, stakeAmount: string) {
  }
}
