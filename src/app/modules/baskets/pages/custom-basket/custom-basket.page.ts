import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../core/services/api.service';
import { ChartsService } from '../../../../core/services/charts.service';
import { IBasketPoolsAndCoinInfo, IPoolsMetadata, PoolsChartOptions } from '../../../../core/models/types';
import { BehaviorSubject } from 'rxjs';
import { basketNameGenerator, getBasketPoolsAndCoins, makeBasket } from '../../../../core/utils/pools-utils';
import { ContractService } from '../../../../core/services/contract.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CustomInvestModalComponent } from '../../components/custom-invest-modal/custom-invest-modal.component';
import { take } from 'rxjs/operators';

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
  public basketPayload: IBasketPoolsAndCoinInfo | null = null;

  constructor(
    private readonly contractService: ContractService,
    private readonly basketService: ApiService,
    private readonly chartsService: ChartsService,
    private readonly dialog: MatDialog
  ) {
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

  editBasketAllocation(config: any[]): void {
    const [poolName, percentage] = config;
    const oldValue = this.chartPoolData[poolName] || 0;
    const newValue = this.chartPoolData[poolName] = percentage;
    const remainder = 100 - oldValue;
    const diff = newValue - oldValue;
    const multiplier = (remainder - diff) / remainder;
    for (const pool in this.chartPoolData) {
      if (pool !== poolName) {
        this.chartPoolData[pool] = +Math.round(this.chartPoolData[pool] * multiplier);
      }
    }
    this.setChart();
  }

  onInvest(): void {
    const dialogRef = this.openDialog();
    dialogRef.afterClosed()
      .pipe(take(1))
      .subscribe((result) => {
        if (result) {
          this.createBasket(result);
        }
      });
  }

  async createBasket(ethAmount: number): Promise<any> {
    const basket = makeBasket(this.chartPoolData);
    const basketPoolAndCoinInfo: IBasketPoolsAndCoinInfo = getBasketPoolsAndCoins(basket, this.pools$.value, this.tokens$.value);
    const name = basketNameGenerator();
    console.log(basketPoolAndCoinInfo, name, 'CREATING_BASKET....');
    await this.contractService.createBasket(name, basketPoolAndCoinInfo, ethAmount);
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
      this.chartPoolData[poolKey] = Math.floor(100 / total);
    });
    this.basketPayload = getBasketPoolsAndCoins(this.chartPoolData, this.pools$.value, this.tokens$.value);
    console.log(this.basketPayload);
  }

  private setChart(): void {
    this.chartOptions = this.chartsService.composeWeightAllocChart(Object.keys(this.chartPoolData), Object.values(this.chartPoolData));
  }

  private openDialog(): MatDialogRef<CustomInvestModalComponent> {
    return this.dialog.open(CustomInvestModalComponent);
  }
}
