import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BasketsRoutingModule } from './baskets-routing.module';
import { CreateBasketPage } from './pages/create-basket/create-basket.page';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { CustomBasketPage } from './pages/custom-basket/custom-basket.page';
import { SharedModule } from '../../shared/shared.module';
import { BasketsPage } from './pages/baskets/baskets.page';

@NgModule({
  declarations: [CreateBasketPage, CustomBasketPage, BasketsPage],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BasketsRoutingModule,
    NgApexchartsModule,
    SharedModule,
  ]
})
export class BasketsModule {
}
