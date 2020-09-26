import { Component, Input, OnInit } from '@angular/core';
import { IBasket, PoolsChartOptions } from '../../../../core/models/types';
import { ChartsService } from '../../../../core/services/charts.service';

@Component({
  selector: 'app-basket',
  templateUrl: './basket.component.html',
  styleUrls: ['./basket.component.scss']
})
export class BasketComponent implements OnInit {
  mBasket: IBasket;
  @Input() set basket(value: IBasket) {
    this.mBasket = value;
    const labels = this.mBasket.pools.map(pool => pool.name);
    const allocs = this.mBasket.pools.map(pool => pool.allocation);
    this.poolChartOptions = this.charts.composeWeightAllocChart(labels, allocs);
  }
  get basket(): IBasket {
    return this.mBasket;
  }
  public poolChartOptions: Partial<PoolsChartOptions>;
  constructor(private charts: ChartsService) { }

  ngOnInit(): void {
  }

}
