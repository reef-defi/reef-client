import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BondsService } from '../../../../core/services/bonds.service';
import { ActivatedRoute } from '@angular/router';
import { filter, map, pluck, shareReplay } from 'rxjs/operators';
import { combineLatest } from 'rxjs/internal/observable/combineLatest';
import {
  Bond,
  BondSaleStatus,
  IProviderUserInfo,
  TokenSymbol,
  TransactionType,
} from '../../../../core/models/types';
import { ConnectorService } from '../../../../core/services/connector.service';
import { UiUtils } from '../../../../shared/utils/ui.utils';
import { ApiService } from '../../../../core/services/api.service';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { TokenUtil } from '../../../../shared/utils/token.util';
import { BondUtil } from '../../../../shared/utils/bond.util';
import { startWith } from 'rxjs/internal/operators/startWith';
import { TokenBalanceService } from '../../../../shared/service/token-balance.service';

@Component({
  selector: 'app-bond',
  templateUrl: './bond.page.html',
  styleUrls: ['./bond.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BondPage {
  stakeAmount: string;

  TransactionType = TransactionType;
  UiUtils = UiUtils;
  BondUtil = BondUtil;
  TokenUtil = TokenUtil;
  BondSaleStatus = BondSaleStatus;

  bond$ = combineLatest([
    this.bondsService.bondsList$,
    this.route.params.pipe(pluck('id')),
  ]).pipe(
    map(([bonds, id]: [{ list: Bond[]; chainId: number }, string]) =>
      bonds.list.find((b) => b.id.toString() === id)
    ),
    startWith({}),
    shareReplay(1)
  );

  bondTimes$ = this.bond$.pipe(
    filter((b: Bond) => !!b && !!b.id),
    switchMap((b: Bond) => b.times$),
    shareReplay(1)
  );

  lockDurationString$ = this.bondTimes$.pipe(
    map((bondTimes) =>
      UiUtils.toMinTimespanText(bondTimes.farmStartTime, bondTimes.farmEndTime)
    )
  );

  stakeTokenBalance$ = combineLatest([
    this.bond$,
    this.connectorService.providerUserInfo$,
  ]).pipe(
    switchMap(([bond, info]: [Bond, IProviderUserInfo]) =>
      this.tokenBalanceService.getTokenBalance$(
        info.address,
        bond.stake as TokenSymbol,
        bond.stakeTokenAddress
      )
    ),
    shareReplay(1)
  );

  constructor(
    private route: ActivatedRoute,
    public bondsService: BondsService,
    public connectorService: ConnectorService,
    public apiService: ApiService,
    public tokenBalanceService: TokenBalanceService
  ) {}

  stake(bond: Bond, stakeAmount: string): void {
    this.bondsService.stake(bond, stakeAmount).then(
      (res) => {
        this.stakeAmount = null;
        bond.stakedBalanceUpdate.next();
      },
      (err) => {
        if (err.message.indexOf('oversubscribed') > 0) {
          bond.stakeMaxAmountReached = true;
        }
      }
    );
  }
}
