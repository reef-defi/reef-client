import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WalletGuard } from './core/guards/wallet.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./modules/home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'baskets',
    loadChildren: () => import('./modules/baskets/baskets.module').then(m => m.BasketsModule),
    canActivate: [WalletGuard],
  },
  {
    path: 'reef',
    loadChildren: () => import('./modules/reef/reef.module').then(m => m.ReefModule),
    canActivate: [WalletGuard],
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
