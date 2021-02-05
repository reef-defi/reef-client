import { Component, EventEmitter, Input, Output } from '@angular/core';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-reef-historic-price',
  templateUrl: './reef-historic-price.component.html',
  styleUrls: ['./reef-historic-price.component.scss'],
})
export class ReefHistoricPriceComponent {
  HighCharts: typeof Highcharts = Highcharts;
  public options: Highcharts.Options | any = {};
  public updateFlag: boolean;
  @Input() set chartData(val: number[][]) {
    if (val) {
      console.log(val, 'hmm');
      this.options = val;
      this.updateFlag = true;
    }
  }
  @Output() dateSpanChange = new EventEmitter();

  onDateChange(val: number): void {
    this.updateFlag = false;
    this.dateSpanChange.emit(val);
  }
}
