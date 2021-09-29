import {Component, OnInit} from '@angular/core';
import {ApiService} from '../../../../core/services/api.service';
import {ChartsService} from '../../../../core/services/charts.service';
import {
  IBasketHistoricRoi,
  IBasketPoolsAndCoinInfo,
  IPoolsMetadata,
  PoolsChartOptions,
} from '../../../../core/models/types';
import {BehaviorSubject} from 'rxjs';
import {
  basketNameGenerator,
  getBasketPoolsAndCoins,
  makeBasket,
} from '../../../../core/utils/pools-utils';
import {ContractService} from '../../../../core/services/contract.service';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {CustomInvestModalComponent} from '../../components/custom-invest-modal/custom-invest-modal.component';
import {map, take} from 'rxjs/operators';
import {combineLatest} from 'rxjs/internal/observable/combineLatest';
import {NotificationService} from '../../../../core/services/notification.service';

@Component({
  selector: 'app-custom-basket',
  templateUrl: './custom-basket.page.html',
  styleUrls: ['./custom-basket.page.scss'],
})
export class CustomBasketPage implements OnInit {
  Object = Object;
  readonly COMPOSITION_LIMIT = this.basketService.COMPOSITION_LIMIT;
  readonly pools$: BehaviorSubject<IPoolsMetadata[]> = this.basketService
    .pools$;
  readonly tokens$: BehaviorSubject<any> = this.basketService.tokens$;
  readonly poolsAndTokens$ = combineLatest(this.pools$, this.tokens$).pipe(
    map(([pools, tokens]: [IPoolsMetadata[], any]) => {
      const arr = Object.keys(tokens).map((key) => ({
        Symbol: key,
        ExchangeName: 'N/A',
        type: 'Token',
      }));
      const pols = pools.map((pool) => ({...pool, type: 'Pool'}));
      return [...pols, ...arr];
    })
  );
  public chartOptions: Partial<PoolsChartOptions>;
  public chartPoolData: { [key: string]: number } = {};
  public basketPayload: IBasketPoolsAndCoinInfo | null = null;
  public currentRoiTimespan = 1;
  public roiData: number[][];

  constructor(
    private readonly contractService: ContractService,
    private readonly basketService: ApiService,
    private readonly chartsService: ChartsService,
    private readonly dialog: MatDialog,
    private readonly notificationService: NotificationService
  ) {
  }

  ngOnInit(): void {
    const basketRef = history.state?.data;
    if (basketRef) {
      this.chartPoolData = basketRef;
      this.getHistoricRoi();
    }
  }

  addPool(poolName: string): void {
    if (!(Object.keys(this.chartPoolData).length < this.COMPOSITION_LIMIT)) {
      alert(`Can't have more than 10 compositions.`);
    } else {
      this.chartPoolData[poolName] = this.calculatePoolAllocation();
      this.balancePoolAllocation();
      this.setChart();
      this.getHistoricRoi();
    }
  }

  removePool(poolName: string): void {
    delete this.chartPoolData[poolName];
    this.balancePoolAllocation();
    this.setChart();
    if (Object.keys(this.chartPoolData).length > 0) {
      this.getHistoricRoi();
    }
  }

  editBasketAllocation(config: any[]): void {
    const [poolName, percentage] = config;
    const oldValue = this.chartPoolData[poolName] || 0;
    const newValue = (this.chartPoolData[poolName] = percentage);
    const remainder = 100 - oldValue;
    const diff = newValue - oldValue;
    const multiplier = (remainder - diff) / remainder;
    for (const pool in this.chartPoolData) {
      if (pool !== poolName) {
        this.chartPoolData[pool] = +Math.round(
          this.chartPoolData[pool] * multiplier
        );
      }
    }
    this.getHistoricRoi();
  }

  onInvest(): void {
    const dialogRef = this.openDialog();
    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((result) => {
        if (result) {
          this.createBasket(result);
        }
      });
  }

  async createBasket(ethAmount: number): Promise<any> {
    this.notificationService.showNotification(
      'We are in the process of building new opportunities on our Reef chain.',
      'Ok',
      'info'
    );

    /*const basket = makeBasket(this.chartPoolData);
    const basketPoolAndCoinInfo: IBasketPoolsAndCoinInfo = getBasketPoolsAndCoins(
      basket,
      this.pools$.value,
      this.tokens$.value
    );
    const name = basketNameGenerator();
    await this.contractService.createBasket(
      name,
      basketPoolAndCoinInfo,
      ethAmount
    );*/
  }

  getHistoricRoi(subtractMonths = 1): void {
    const basket = makeBasket(this.chartPoolData);
    this.currentRoiTimespan = subtractMonths;
    this.basketService
      .getHistoricRoi(basket, subtractMonths)
      .subscribe((hRoi: IBasketHistoricRoi) => {
        this.roiData = this.chartsService.composeHighChart(
          this.extractRoi(hRoi)
        );
      });
  }

  private calculatePoolAllocation(): number {
    const total = Object.keys(this.chartPoolData).length;
    if (total === 0) {
      return 100;
    }
    return 100 / (total + 1);
  }

  private balancePoolAllocation(): void {
    const total = Object.keys(this.chartPoolData).length;
    Object.keys(this.chartPoolData).forEach((poolKey) => {
      this.chartPoolData[poolKey] = Math.floor(100 / total);
    });
    this.basketPayload = getBasketPoolsAndCoins(
      this.chartPoolData,
      this.pools$.value,
      this.tokens$.value
    );
  }

  private setChart(): void {
    this.chartOptions = this.chartsService.composeWeightAllocChart(
      Object.keys(this.chartPoolData),
      Object.values(this.chartPoolData)
    );
  }

  private openDialog(): MatDialogRef<CustomInvestModalComponent> {
    return this.dialog.open(CustomInvestModalComponent);
  }

  private extractRoi(obj: IBasketHistoricRoi): number[][] {
    return Object.keys(obj).map((key) => [
      new Date(key).getTime(),
      +obj[key].weighted_roi.toFixed(2),
    ]);
  }
}
