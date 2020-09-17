import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MyBasketsPage } from './pages/my-baskets/my-baskets.page';
import { CustomBasketComponent } from './pages/custom-basket/custom-basket.component';

const routes: Routes = [
  {
    path: '',
    component: MyBasketsPage,
  },
  {
    path: 'custom-basket',
    component: CustomBasketComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BasketsRoutingModule {
}
