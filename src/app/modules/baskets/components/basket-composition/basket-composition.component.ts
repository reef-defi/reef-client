import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HistoricRoiChartOptions, PoolsChartOptions } from '../../../../core/models/types';

@Component({
  selector: 'app-basket-composition',
  templateUrl: './basket-composition.component.html',
  styleUrls: ['./basket-composition.component.scss']
})
export class BasketCompositionComponent {
  @Input() poolChartOptions: Partial<PoolsChartOptions>;
  @Input() roiChartOptions: Partial<HistoricRoiChartOptions>;
  @Input() activeTimeSpan = 1;
  @Output() dateSpanChange = new EventEmitter<number>();

  constructor() {
  }

  onDateSpanChange(val: number): void {
    this.dateSpanChange.emit(val);
  }

}
