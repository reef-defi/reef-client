import { Component, OnInit } from '@angular/core';
import { BasketsService } from '../../../../core/services/baskets.service';
import { ApexChartOptions, IGenerateBasketResponse } from '../../../../core/models/types';
import { merge, startWith, switchMap } from 'rxjs/operators';
import { PoolService } from '../../../../core/services/pool.service';
import { FormControl } from '@angular/forms';
import { tap } from 'rxjs/internal/operators/tap';
import { ChartsService } from '../../../../core/services/charts.service';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-my-baskets',
  templateUrl: './my-baskets.page.html',
  styleUrls: ['./my-baskets.page.scss']
})
export class MyBasketsPage implements OnInit {
  readonly pools$ = this.basketsService.listPools();
  public chartOptions: Partial<ApexChartOptions>;
  ethAmount = new FormControl('1');
  risk = new FormControl(10);

  constructor(
    private readonly basketsService: BasketsService,
    private readonly poolService: PoolService,
    private readonly chartsService: ChartsService) {
  }

  ngOnInit(): void {
    this.getAllPools();
    this.getEthPrice();
    this.pools$.subscribe(console.log);
    combineLatest(
      this.ethAmount.valueChanges.pipe(startWith(this.ethAmount.value)),
      this.risk.valueChanges.pipe(startWith(this.risk.value)),
    ).subscribe(() => {
      this.generateBasket();
    });
  }

  generateBasket(): any {
    return this.basketsService.generateBasket({amount: this.ethAmount.value, risk_aversion: this.risk.value}).pipe(
      tap((data) => {
        console.log(data, 'generated_basket')
        this.chartOptions = this.chartsService.composeWeightAllocChart(Object.keys(data), Object.values(data));
      }),
      switchMap((data: IGenerateBasketResponse) => this.basketsService.getHistoricRoi(data))
    ).subscribe(console.log);
  }

  getAllPools(): void {
    this.poolService.getAllPools().subscribe(console.log);
  }

  getEthPrice(): void {
    this.poolService.getEthPrice().subscribe(console.log);
  }

}
