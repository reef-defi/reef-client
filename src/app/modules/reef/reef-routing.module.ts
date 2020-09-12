import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReefPage } from './pages/reef/reef.page';

const routes: Routes = [
  {
    path: '',
    component: ReefPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReefRoutingModule {
}
