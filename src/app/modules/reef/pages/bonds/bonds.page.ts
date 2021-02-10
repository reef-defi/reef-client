import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BondsService } from '../../../../core/services/bonds.service';
import { UiUtils } from '../../../../shared/utils/ui.utils';
import { DateTimeUtil } from '../../../../shared/utils/date-time.util';
import { Observable, timer } from 'rxjs';
import { Bond, BondSaleStatus } from '../../../../core/models/types';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { map, shareReplay } from 'rxjs/operators';

@Component({
  selector: 'app-bonds',
  templateUrl: './bonds.page.html',
  styleUrls: ['./bonds.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BondsPage {
  UiUtils = UiUtils;
  DateTimeUtil = DateTimeUtil;
  BondSaleStatus = BondSaleStatus;

  private timer$ = timer(0, 1000);
  private bondStatus = new Map();

  constructor(public bondsService: BondsService) {}

  getBondStatus$(bond: Bond): Observable<BondSaleStatus> {
    if (!this.bondStatus.has(bond.id)) {
      const status$ = this.timer$.pipe(
        switchMap(() => this.bondsService.getBondTimeValues$(bond)),
        map((b) => this.bondsService.toBondSaleStatus(b)),
        shareReplay(1)
      );
      this.bondStatus.set(bond.id, status$);
    }
    return this.bondStatus.get(bond.id);
  }
}
