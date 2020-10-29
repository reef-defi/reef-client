import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VaultsRoutingModule } from './vaults-routing.module';
import { VaultsPage } from './pages/vaults/vaults.page';
import { SharedModule } from '../../shared/shared.module';
import { DiversifyVaultsComponent } from './components/diversify-vaults/diversify-vaults.component';
import { VaultsListComponent } from './components/vaults-list/vaults-list.component';

const pages = [VaultsPage];
const components = [DiversifyVaultsComponent, VaultsListComponent];

@NgModule({
  declarations: [...pages, ...components],
  imports: [
    CommonModule,
    VaultsRoutingModule,
    SharedModule
  ]
})
export class VaultsModule { }
