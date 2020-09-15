import { Component, OnInit } from '@angular/core';
import { BasketsService } from '../../../../core/services/baskets.service';
import { IGenerateBasketRequest, IGenerateBasketResponse } from '../../../../core/models/types';
import { switchMap } from 'rxjs/operators';
import { PoolService } from '../../../../core/services/pool.service';

@Component({
  selector: 'app-my-baskets',
  templateUrl: './my-baskets.page.html',
  styleUrls: ['./my-baskets.page.scss']
})
export class MyBasketsPage implements OnInit {
  readonly pools$ = this.basketsService.listPools();

  constructor(private readonly basketsService: BasketsService, private readonly poolService: PoolService) {
  }

  ngOnInit(): void {
    this.getAllPools();
    this.getEthPrice();
  }

  generateBasket(payload: IGenerateBasketRequest): any {
    return this.basketsService.generateBasket(payload).pipe(
      switchMap((data: IGenerateBasketResponse) => this.basketsService.getHistoricRoi(data))
    ).subscribe(console.log);
  }

  getAllPools(): void {
    this.poolService.getAllPools().subscribe(console.log);
  }

  getEthPrice(): void {
    this.poolService.getEthPrice().subscribe(console.log)
  }

}
