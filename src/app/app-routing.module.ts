import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./modules/home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'baskets',
    loadChildren: () => import('./modules/baskets/baskets.module').then(m => m.BasketsModule)
  },
  {
    path: 'reef',
    loadChildren: () => import('./modules/reef/reef.module').then(m => m.ReefModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
