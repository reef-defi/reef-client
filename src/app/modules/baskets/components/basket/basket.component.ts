import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  HistoricRoiChartOptions,
  IBasket,
  IBasketHistoricRoi,
  IGenerateBasketResponse,
  PoolsChartOptions
} from '../../../../core/models/types';
import { ChartsService } from '../../../../core/services/charts.service';
import { ApiService } from '../../../../core/services/api.service';
import { Subscription } from 'rxjs';

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
    const obj = this.getChartLabels(this.mBasket);
    this.poolChartOptions = this.charts.composeWeightAllocChart(Object.keys(obj), Object.values(obj));
    this.getHistoricRoi(obj, 1);
  }

  get basket(): IBasket {
    return this.mBasket;
  }

  @Output() invest = new EventEmitter();
  public poolChartOptions: Partial<PoolsChartOptions>;
  public roiChartOptions: Partial<HistoricRoiChartOptions>;

  constructor(private readonly charts: ChartsService,
              private readonly apiService: ApiService) {
  }

  onInvest(): void {
    // const allocs = this.basket.pools.map(pool => +pool.allocation);
    // const value = {
    //   basketIdx: this.basketIndex,
    //   weights: allocs,
    //   name: this.basket.name
    // };
    // this.invest.emit(value);
  }

  private getChartLabels(basket: IBasket): IGenerateBasketResponse {
    const {Tokens, BalancerPools, MooniswapPools, UniswapPools} = basket;
    const names = [...Tokens.pools, ...BalancerPools.pools, ...MooniswapPools.pools, ...UniswapPools.pools].map(p => p.name);
    const weights = [...Tokens.weights, ...BalancerPools.weights, ...MooniswapPools.weights, ...UniswapPools.weights];
    const temp = {};
    for (let i = 0; i < names.length; i++) {
      temp[names[i]] = weights[i];
    }
    return temp;
  }

  private getHistoricRoi(basket: IGenerateBasketResponse, subtractMonths: number): Subscription {
    return this.apiService.getHistoricRoi(basket, subtractMonths).subscribe((historicRoi: IBasketHistoricRoi) => {
      const roi = this.extractRoi(historicRoi);
      this.roiChartOptions = this.charts.composeHistoricRoiChart(Object.keys(historicRoi), roi);
    });
  }

  private extractRoi(obj: IBasketHistoricRoi): number[] {
    return Object.values(obj).map((val: any) => +val.weighted_roi.toFixed(3));
  }
}
