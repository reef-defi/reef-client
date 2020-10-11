import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../core/services/api.service';
import {
  PoolsChartOptions,
  IGenerateBasketResponse,
  HistoricRoiChartOptions,
  IBasketHistoricRoi,
  IBasketPoolsAndCoinInfo
} from '../../../../core/models/types';
import { first, merge, startWith, switchMap } from 'rxjs/operators';
import { PoolService } from '../../../../core/services/pool.service';
import { FormControl } from '@angular/forms';
import { tap } from 'rxjs/internal/operators/tap';
import { ChartsService } from '../../../../core/services/charts.service';
import { combineLatest, Subscription } from 'rxjs';
import { basketNameGenerator, getBasketPoolsAndCoins, convertToInt } from '../../../../core/utils/pools-utils';
import { ContractService } from '../../../../core/services/contract.service';
import { ConnectorService } from '../../../../core/services/connector.service';

@Component({
  selector: 'app-my-baskets',
  templateUrl: './create-basket.page.html',
  styleUrls: ['./create-basket.page.scss']
})
export class CreateBasketPage implements OnInit {
  readonly pools$ = this.basketsService.pools$;
  readonly tokens$ = this.basketsService.tokens$;
  public basket: IGenerateBasketResponse = null;
  public poolChartOptions: Partial<PoolsChartOptions>;
  public roiChartOptions: Partial<HistoricRoiChartOptions>;
  public basketPoolAndCoinInfo: IBasketPoolsAndCoinInfo | {} = {};
  public currentRoiTimespan = 1;
  ethAmount = new FormControl('1');
  risk = new FormControl(10);

  constructor(
    private readonly basketsService: ApiService,
    private readonly poolService: PoolService,
    private readonly chartsService: ChartsService,
    private readonly contractService: ContractService,
    private readonly connectorService: ConnectorService) {
  }

  ngOnInit(): void {
    this.getAllPools();
    this.getEthPrice();
    combineLatest(
      this.ethAmount.valueChanges.pipe(startWith(this.ethAmount.value)),
      this.risk.valueChanges.pipe(startWith(this.risk.value)),
    ).subscribe(() => {
      this.generateBasket();
    });
    this.connectorService.currentProviderName$
      .pipe(first(ev => !!ev))
      .subscribe((data: any) => {
        if (data) {
          this.connectToContract();
        }
      });
  }

  generateBasket(): any {
    return this.basketsService.generateBasket({amount: this.ethAmount.value, risk_aversion: this.risk.value}).pipe(
      tap((data) => {
        this.basket = this.makeBasket(data);
        this.poolChartOptions = this.chartsService.composeWeightAllocChart(Object.keys(this.basket), Object.values(this.basket));
        console.log(data, 'generated_basket');
      }),
      switchMap((data: IGenerateBasketResponse) => this.basketsService.getHistoricRoi(data))
    ).subscribe((historicRoi: IBasketHistoricRoi) => {
      const roi = this.extractRoi(historicRoi);
      this.roiChartOptions = this.chartsService.composeHistoricRoiChart(Object.keys(historicRoi), roi);
    });
  }

  getHistoricRoi(basket: IGenerateBasketResponse, subtractMonths: number): Subscription {
    this.currentRoiTimespan = subtractMonths;
    return this.basketsService.getHistoricRoi(basket, subtractMonths).subscribe((historicRoi: IBasketHistoricRoi) => {
      const roi = this.extractRoi(historicRoi);
      this.roiChartOptions = this.chartsService.composeHistoricRoiChart(Object.keys(historicRoi), roi);
    });
  }

  async createBasket(): Promise<any> {
    console.log('Creating Basket...');
    const basketPoolAndCoinInfo: IBasketPoolsAndCoinInfo = getBasketPoolsAndCoins(this.basket, this.pools$.value, this.tokens$.value);
    const name = basketNameGenerator();
    console.log(basketPoolAndCoinInfo, name, 'CREATING_BASKET....');
    await this.contractService.createBasket(name, basketPoolAndCoinInfo);
  }

  getAllPools(): void {
    this.poolService.getAllPools().subscribe(console.log);
  }

  getEthPrice(): void {
    this.poolService.getEthPrice().subscribe(console.log);
  }

  private extractRoi(obj: IBasketHistoricRoi): number[] {
    return Object.values(obj).map((val: any) => +val.weighted_roi.toFixed(3));
  }

  private connectToContract(): void {
    this.contractService.connectToContract();
  }

  private makeBasket(basket: IGenerateBasketResponse): IGenerateBasketResponse {
    const b: IGenerateBasketResponse = Object.keys(basket)
      .map(key => ({[key]: convertToInt(basket[key] * 100)})).reduce((memo, curr) => ({...memo, ...curr}));
    const weights = Object.values(b);
    const sum = weights.reduce((memo, curr) => memo + curr);
    if (sum === 100) {
      return basket;
    }
    let max = Math.max(...weights);
    const poolMax = Object.keys(b).find(key => b[key] === max);
    max = sum > 100 ? max - (sum - 100) : max + (100 - sum);
    return {
      ...b,
      [poolMax]: max
    };
  }
}
