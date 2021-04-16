import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../core/services/api.service';
import { ChartsService } from '../../../../core/services/charts.service';
import {
  BasketPositionError,
  IBasketHistoricRoi,
  IBasketPoolsAndCoinInfo,
  IPoolsMetadata,
  PoolsChartOptions,
} from '../../../../core/models/types';
import { BehaviorSubject } from 'rxjs';
import {
  basketNameGenerator, getBasketErrorSymbol,
  getBasketPoolsAndCoins,
  makeBasket,
} from '../../../../core/utils/pools-utils';
import { ContractService } from '../../../../core/services/contract.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CustomInvestModalComponent } from '../../components/custom-invest-modal/custom-invest-modal.component';
import { map, take } from 'rxjs/operators';
import { combineLatest } from 'rxjs/internal/observable/combineLatest';
import {ErrorUtils} from '../../../../shared/utils/error.utils';

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
      const pols = pools.map((pool) => ({ ...pool, type: 'Pool' }));
      return [...pols, ...arr];
    })
  );
  public chartOptions: Partial<PoolsChartOptions>;
  public chartPoolData: { [key: string]: number } = {};
  public basketPayload: IBasketPoolsAndCoinInfo | null = null;
  public currentRoiTimespan = 1;
  public roiData: number[][];
  public basketPositionErrorSymbol: string;

  constructor(
    private readonly contractService: ContractService,
    private readonly basketService: ApiService,
    private readonly chartsService: ChartsService,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const basketRef = history.state?.data;
    if (basketRef) {
      this.chartPoolData = basketRef;
      this.getHistoricRoi();
    }
  }

  addPool(poolName: string): void {
    this.basketPositionErrorSymbol = null;
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
    if (poolName === this.basketPositionErrorSymbol) {
      this.basketPositionErrorSymbol = null;
    }
    delete this.chartPoolData[poolName];
    this.balancePoolAllocation();
    this.setChart();
    if (Object.keys(this.chartPoolData).length > 0) {
      this.getHistoricRoi();
    }
  }

  editBasketAllocation(config: any[]): void {
    this.basketPositionErrorSymbol = null;
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
    this.basketPositionErrorSymbol = null;
    const basket = makeBasket(this.chartPoolData);
    const basketPoolAndCoinInfo: IBasketPoolsAndCoinInfo = getBasketPoolsAndCoins(
      basket,
      this.pools$.value,
      this.tokens$.value
    );
    const name = basketNameGenerator();
    try {
    await this.contractService.createBasket(
      name,
      basketPoolAndCoinInfo,
      ethAmount
    );
    } catch (err){
      // err = `///R_ERRORS|POS_TYPE=BAL_POOL |IDENT_1=0x432081eF9aa1b8503F8C7Be37E4bB158A0543Da9 |IDENT_2=0x45645///R_ERRORS`;
      const basketPositionError = ErrorUtils.parseBasketPositionError(err);
      if (basketPositionError) {
        this.basketPositionErrorSymbol = getBasketErrorSymbol(basketPositionError, this.pools$.value, this.tokens$.value);
      }
    }
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
