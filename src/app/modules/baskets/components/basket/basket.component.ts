import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IBasket, PoolsChartOptions } from '../../../../core/models/types';
import { ChartsService } from '../../../../core/services/charts.service';

@Component({
  selector: 'app-basket',
  templateUrl: './basket.component.html',
  styleUrls: ['./basket.component.scss']
})
export class BasketComponent {
  private mBasket: IBasket;
  @Input() basketIndex: number | undefined;

  @Input() set basket(value: IBasket) {
    this.mBasket = value;
    const labels = this.mBasket.pools.map(pool => pool.name);
    const allocs = this.mBasket.pools.map(pool => pool.allocation);
    this.poolChartOptions = this.charts.composeWeightAllocChart(labels, allocs);
  }

  get basket(): IBasket {
    return this.mBasket;
  }

  @Output() invest = new EventEmitter();
  public poolChartOptions: Partial<PoolsChartOptions>;

  constructor(private readonly charts: ChartsService) {
  }

  onInvest(): void {
    const allocs = this.basket.pools.map(pool => +pool.allocation);
    const value = {
      basketIdx: this.basketIndex,
      weights: allocs,
      name: this.basket.name
    };
    this.invest.emit(value);
  }

}
