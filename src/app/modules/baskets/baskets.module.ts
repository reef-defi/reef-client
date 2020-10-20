import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BasketsRoutingModule } from './baskets-routing.module';
import { CreateBasketPage } from './pages/create-basket/create-basket.page';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomBasketPage } from './pages/custom-basket/custom-basket.page';
import { SharedModule } from '../../shared/shared.module';
import { BasketsPage } from './pages/baskets/baskets.page';
import { BasketComponent } from './components/basket/basket.component';
import { CreateBasketComponent } from './components/create-basket/create-basket.component';
import { BasketCompositionComponent } from './components/basket-composition/basket-composition.component';
import { LiquidateModalComponent } from './components/liquidate-modal/liquidate-modal.component';
import { MatRippleModule } from '@angular/material/core';
import { CustomBasketPoolsComponent } from './components/custom-basket-pools/custom-basket-pools.component';
import { CustomInvestModalComponent } from './components/custom-invest-modal/custom-invest-modal.component';
import { BasketRoiComponent } from './components/basket-roi/basket-roi.component';

const pages = [
  CreateBasketPage,
  CustomBasketPage,
  BasketsPage,
];
const components = [
  BasketComponent,
  CreateBasketComponent,
  BasketCompositionComponent,
  LiquidateModalComponent,
  CustomBasketPoolsComponent,
];

@NgModule({
  declarations: [...pages, ...components, CustomInvestModalComponent, BasketRoiComponent,],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BasketsRoutingModule,
    SharedModule,
    MatRippleModule,
  ]
})
export class BasketsModule {
}
