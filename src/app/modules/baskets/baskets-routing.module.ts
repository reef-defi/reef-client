import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateBasketPage } from './pages/my-baskets/create-basket.page';
import { CustomBasketPage } from './pages/custom-basket/custom-basket.page';
import { BasketsPage } from './pages/baskets/baskets.page';
import { WalletGuard } from '../../core/guards/wallet.guard';

const routes: Routes = [
  {
    path: '',
    component: BasketsPage,
    canActivate: [WalletGuard]
  },
  {
    path: 'create-basket',
    component: CreateBasketPage,
    canActivate: [WalletGuard]
  },
  {
    path: 'custom-basket',
    component: CustomBasketPage,
    canActivate: [WalletGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BasketsRoutingModule {
}
