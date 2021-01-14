import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-asset-distribution-chart',
  templateUrl: './asset-distribution-chart.component.html',
  styleUrls: ['./asset-distribution-chart.component.scss']
})
export class AssetDistributionChartComponent {
  HighCharts: typeof Highcharts = Highcharts;
  public options: Highcharts.Options | any = {};
  public updateFlag: boolean;
  @Input() set chartData(val: number[][]) {
    if (val) {
      this.options = val;
      this.updateFlag = true;
    }
  }
  @Input() isList = false;
  @Output() dateSpanChange = new EventEmitter();

}
