import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BasketsRoutingModule } from './baskets-routing.module';
import { MyBasketsPage } from './pages/my-baskets/my-baskets.page';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { CustomBasketPage } from './pages/custom-basket/custom-basket.page';
import { MatSliderModule } from '@angular/material/slider';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [MyBasketsPage, CustomBasketPage],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BasketsRoutingModule,
    NgApexchartsModule,
    MatSliderModule,
    SharedModule,
  ]
})
export class BasketsModule {
}
