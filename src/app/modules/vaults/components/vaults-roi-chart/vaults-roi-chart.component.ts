import { Component, EventEmitter, Input, Output } from '@angular/core';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-vaults-roi-chart',
  templateUrl: './vaults-roi-chart.component.html',
  styleUrls: ['./vaults-roi-chart.component.scss'],
})
export class VaultsRoiChartComponent {
  HighCharts: typeof Highcharts = Highcharts;
  public options: Highcharts.Options | any = {};
  public updateFlag: boolean;
  @Input() set roiChartData(val: number[][]) {
    if (val) {
      this.options = val;
      console.log(this.options, 'HMMM');
      this.updateFlag = true;
    }
  }
  @Input() isList = false;
  @Output() dateSpanChange = new EventEmitter();

  onDateChange(val: number): void {
    this.updateFlag = false;
    this.dateSpanChange.emit(val);
  }
}
