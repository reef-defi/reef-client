import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MyBasketsPage } from './pages/my-baskets/my-baskets.page';
import { CustomBasketPage } from './pages/custom-basket/custom-basket.page';

const routes: Routes = [
  {
    path: '',
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
