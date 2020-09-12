import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MyBasketsPage } from './pages/my-baskets/my-baskets.page';

const routes: Routes = [
  {
    path: '',
    component: MyBasketsPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyBasketsRoutingModule {
}
