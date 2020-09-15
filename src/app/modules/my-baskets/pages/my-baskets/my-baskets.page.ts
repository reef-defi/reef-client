import { Component, OnInit } from '@angular/core';
import { BasketsService } from '../../../../core/services/baskets.service';
import { IGenerateBasketRequest, IGenerateBasketResponse } from '../../../../core/models/types';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-my-baskets',
  templateUrl: './my-baskets.page.html',
  styleUrls: ['./my-baskets.page.scss']
})
export class MyBasketsPage implements OnInit {
  readonly pools$ = this.basketsService.listPools();
  constructor(private readonly basketsService: BasketsService) { }

  ngOnInit(): void {
  }

  generateBasket(payload: IGenerateBasketRequest): any {
    return this.basketsService.generateBasket(payload).pipe(
      switchMap((data: IGenerateBasketResponse) => this.basketsService.getHistoricRoi(data))
    ).subscribe(console.log);
  }

}
