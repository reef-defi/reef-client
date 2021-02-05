import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../core/services/api.service';
import {
  IBasketHistoricRoi,
  IBasketPoolsAndCoinInfo,
  IGenerateBasketResponse,
  PoolsChartOptions,
} from '../../../../core/models/types';
import { first, startWith, switchMap, take } from 'rxjs/operators';
import { PoolService } from '../../../../core/services/pool.service';
import { FormControl } from '@angular/forms';
import { tap } from 'rxjs/internal/operators/tap';
import { ChartsService } from '../../../../core/services/charts.service';
import { combineLatest } from 'rxjs';
import {
  basketNameGenerator,
  convertToInt,
  getBasketPoolsAndCoins,
} from '../../../../core/utils/pools-utils';
import { ContractService } from '../../../../core/services/contract.service';
import { ConnectorService } from '../../../../core/services/connector.service';

@Component({
  selector: 'app-my-baskets',
  templateUrl: './create-basket.page.html',
  styleUrls: ['./create-basket.page.scss'],
})
export class CreateBasketPage implements OnInit {
  readonly pools$ = this.basketsService.pools$;
  readonly tokens$ = this.basketsService.tokens$;
  public userInfo = this.connectorService.providerUserInfo$;
  public basket: IGenerateBasketResponse = null;
  public poolChartOptions: Partial<PoolsChartOptions>;
  public roiData: number[][];
  public basketPoolAndCoinInfo: IBasketPoolsAndCoinInfo | {} = {};
  public currentRoiTimespan = 1;
  public minimalInvestment: string | undefined;
  ethAmount = new FormControl(1);
  risk = new FormControl('low');

  constructor(
    private readonly basketsService: ApiService,
    private readonly poolService: PoolService,
    private readonly chartsService: ChartsService,
    private readonly contractService: ContractService,
    private readonly connectorService: ConnectorService
  ) {}

  ngOnInit(): void {
    this.getAllPools();
    this.getEthPrice();
    combineLatest(
      this.ethAmount.valueChanges.pipe(startWith(this.ethAmount.value)),
      this.risk.valueChanges.pipe(startWith('low'))
    ).subscribe(() => {
      this.generateBasket();
    });
    this.contractService.basketContract$
      .pipe(first((val) => !!val))
      .subscribe(async () => {
        this.minimalInvestment = await this.getMinimalInvestment();
      });
  }

  generateBasket(subtractMonths: number = 1): any {
    this.currentRoiTimespan = subtractMonths;
    return this.basketsService
      .generateBasket({
        amount: this.ethAmount.value,
        risk_level: this.risk.value,
      })
      .pipe(
        tap((data) => {
          this.basket = this.makeBasket(data);
          this.poolChartOptions = this.chartsService.composeWeightAllocChart(
            Object.keys(this.basket),
            Object.values(this.basket)
          );
        }),
        switchMap((data: IGenerateBasketResponse) =>
          this.basketsService.getHistoricRoi(this.basket, subtractMonths)
        )
      )
      .subscribe((historicRoi: IBasketHistoricRoi) => {
        this.roiData = this.chartsService.composeHighChart(
          this.extractRoi(historicRoi)
        );
      });
  }

  getHistoricRoi(subtractMonths: number): void {
    this.currentRoiTimespan = subtractMonths;
    this.basketsService
      .getHistoricRoi(this.basket, subtractMonths)
      .subscribe((hRoi: IBasketHistoricRoi) => {
        this.roiData = this.chartsService.composeHighChart(
          this.extractRoi(hRoi)
        );
      });
  }

  async createBasket(): Promise<any> {
    console.log('Creating Basket...');
    const basketPoolAndCoinInfo: IBasketPoolsAndCoinInfo = getBasketPoolsAndCoins(
      this.basket,
      this.pools$.value,
      this.tokens$.value
    );
    const name = basketNameGenerator();
    console.log(basketPoolAndCoinInfo, name, 'CREATING_BASKET....');
    await this.contractService.createBasket(
      name,
      basketPoolAndCoinInfo,
      this.ethAmount.value
    );
  }

  onPercentageChange(val: number): void {
    this.ethAmount.patchValue(val);
  }

  getAllPools(): void {
    this.poolService.getAllPools().subscribe(console.log);
  }

  getEthPrice(): void {
    this.poolService.ethPrice$.pipe(take(1)).subscribe(console.log);
  }

  getMinimalInvestment(): Promise<string> {
    return this.contractService.getMinimalInvestment();
  }

  private extractRoi(obj: IBasketHistoricRoi): number[][] {
    return Object.keys(obj).map((key) => [
      new Date(key).getTime(),
      +obj[key].weighted_roi.toFixed(2),
    ]);
  }

  private makeBasket(basket: IGenerateBasketResponse): IGenerateBasketResponse {
    const b: IGenerateBasketResponse = Object.keys(basket)
      .map((key) => ({ [key]: convertToInt(basket[key] * 100) }))
      .reduce((memo, curr) => ({ ...memo, ...curr }));
    const weights = Object.values(b);
    const sum = weights.reduce((memo, curr) => memo + curr);
    if (sum === 100) {
      return b;
    }
    let max = Math.max(...weights);
    const poolMax = Object.keys(b).find((key) => b[key] === max);
    max = sum > 100 ? max - (sum - 100) : max + (100 - sum);
    return {
      ...b,
      [poolMax]: max,
    };
  }
}
