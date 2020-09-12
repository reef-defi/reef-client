import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MyBasketsRoutingModule } from './my-baskets-routing.module';
import { MyBasketsPage } from './pages/my-baskets/my-baskets.page';


@NgModule({
  declarations: [MyBasketsPage],
  imports: [
    CommonModule,
    MyBasketsRoutingModule
  ]
})
export class MyBasketsModule { }
