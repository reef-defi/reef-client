import { Component, EventEmitter, Input, Output } from '@angular/core';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-basket-roi',
  templateUrl: './basket-roi.component.html',
  styleUrls: ['./basket-roi.component.scss']
})
export class BasketRoiComponent {
  HighCharts: typeof Highcharts = Highcharts;
  public updateFlag: boolean;
  public options: Highcharts.Options | any = {};
  @Input() set roiData(val: number[][]) {
    if (val) {
      this.options = val;
      this.updateFlag = true;
    }
  }
  @Input() activeTimeSpan = 1;
  @Input() isList = false;
  @Output() dateSpanChange = new EventEmitter<number>();

  constructor() {
  }

  onDateSpanChange(val: number): void {
    this.updateFlag = false;
    this.dateSpanChange.emit(val);
  }

}
