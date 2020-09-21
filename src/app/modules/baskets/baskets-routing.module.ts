import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MyBasketsPage } from './pages/my-baskets/my-baskets.page';
import { CustomBasketPage } from './pages/custom-basket/custom-basket.page';
import { BasketsPage } from './pages/baskets/baskets.page';

const routes: Routes = [
  {
    path: '',
    component: BasketsPage,
  },
  {
    path: 'my-baskets',
    component: MyBasketsPage,
  },
  {
    path: 'custom-basket',
    component: CustomBasketPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BasketsRoutingModule {
}
