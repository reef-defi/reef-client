import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VaultsPage } from './pages/vaults/vaults.page';

const routes: Routes = [
  {
    path: '',
    component: VaultsPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VaultsRoutingModule { }
