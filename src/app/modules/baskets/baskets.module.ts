import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BasketsRoutingModule } from './baskets-routing.module';
import { MyBasketsPage } from './pages/my-baskets/my-baskets.page';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { CustomBasketComponent } from './pages/custom-basket/custom-basket.component';
import { MatSliderModule } from '@angular/material/slider';

@NgModule({
  declarations: [MyBasketsPage, CustomBasketComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BasketsRoutingModule,
    NgApexchartsModule,
    MatSliderModule
  ]
})
export class BasketsModule {
}
