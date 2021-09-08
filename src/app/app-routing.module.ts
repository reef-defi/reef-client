import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WalletGuard } from './core/guards/wallet.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./modules/home/home.module').then((m) => m.HomeModule),
  },
  {
    path: 'reef',
    loadChildren: () =>
      import('./modules/reef/reef.module').then((m) => m.ReefModule),
    canActivate: [WalletGuard],
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./modules/dashboard/dashboard.module').then(
        (m) => m.DashboardModule
      ),
    canActivate: [WalletGuard],
  },
  {
    path: 'baskets',
    loadChildren: () =>
      import('./modules/baskets/baskets.module').then((m) => m.BasketsModule),
    canActivate: [WalletGuard],
  },
  {
    path: 'card',
    redirectTo: '/reef/card',
  },
  // {
  //   path: 'vaults',
  //   loadChildren: () =>
  //     import('./modules/vaults/vaults.module').then((m) => m.VaultsModule),
  //   canActivate: [WalletGuard],
  // },
  // {
  //   path: 'binance',
  //   loadChildren: () => import('./modules/binance/binance.module').then(m => m.BinanceModule),
  //   canActivate: [WalletGuard],
  // },
  {
    path: '**',
    redirectTo: '/',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
