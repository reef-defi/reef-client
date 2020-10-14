import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../core/services/api.service';
import { ChartsService } from '../../../../core/services/charts.service';
import { PoolsChartOptions, IPoolsMetadata, IBasketPoolsAndCoinInfo } from '../../../../core/models/types';
import { BehaviorSubject, Observable } from 'rxjs';
import { getBasketPoolsAndCoins } from '../../../../core/utils/pools-utils';

@Component({
  selector: 'app-custom-basket',
  templateUrl: './custom-basket.page.html',
  styleUrls: ['./custom-basket.page.scss']
})
export class CustomBasketPage implements OnInit {
  Object = Object;
  readonly COMPOSITION_LIMIT = this.basketService.COMPOSITION_LIMIT;
  readonly pools$: BehaviorSubject<IPoolsMetadata[]> = this.basketService.pools$;
  readonly tokens$: BehaviorSubject<any> = this.basketService.tokens$;
  public chartOptions: Partial<PoolsChartOptions>;
  public chartPoolData: { [key: string]: number } = {};
  public poolsSearchVal = '';
  public basketPayload: IBasketPoolsAndCoinInfo | null = null;
  constructor(private readonly basketService: ApiService, private readonly chartsService: ChartsService) {
  }

  ngOnInit(): void {
  }

  addPool(poolName: string): void {
    if (!(Object.keys(this.chartPoolData).length < this.COMPOSITION_LIMIT)) {
      console.error(`Can't have more than 10 compositions.`);
    } else {
      this.chartPoolData[poolName] = this.calculatePoolAllocation();
      this.balancePoolAllocation();
      this.setChart();
    }
  }

  removePool(poolName: string): void {
    delete this.chartPoolData[poolName];
    this.balancePoolAllocation();
    this.setChart();
  }

  editBasketAllocation(poolName: string, percentage: number): void {
    const oldValue = this.chartPoolData[poolName] || 0;
    const newValue = this.chartPoolData[poolName] = percentage;
    const remainder = 100 - oldValue;
    const diff = newValue - oldValue;
    const multiplier = (remainder - diff) / remainder;
    for (const pool in this.chartPoolData) {
      if (pool !== poolName) {
        this.chartPoolData[pool] = +(this.chartPoolData[pool] * multiplier).toFixed(2);
      }
    }
    this.setChart();
  }

  formatSliderLabel(value: number): string {
    return `${value}%`;
  }

  disableSlider(): boolean {
    return Object.keys(this.chartPoolData).length === 1;
  }

  private calculatePoolAllocation(): number {
    const total = Object.keys(this.chartPoolData).length;
    if (total === 0) {
      return 100;
    }
    return (100 / (total + 1));
  }

  private balancePoolAllocation(): void {
    const total = Object.keys(this.chartPoolData).length;
    Object.keys(this.chartPoolData).forEach(poolKey => {
      this.chartPoolData[poolKey] = 100 / total;
    });
    this.basketPayload = getBasketPoolsAndCoins(this.chartPoolData, this.pools$.value, this.tokens$.value);
    console.log(this.basketPayload);
  }

  private setChart(): void {
    this.chartOptions = this.chartsService.composeWeightAllocChart(Object.keys(this.chartPoolData), Object.values(this.chartPoolData));
  }
}
