import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VaultsRoutingModule } from './vaults-routing.module';
import { VaultsPage } from './pages/vaults/vaults.page';
import { SharedModule } from '../../shared/shared.module';
import { DiversifyVaultsComponent } from './components/diversify-vaults/diversify-vaults.component';
import { VaultsListComponent } from './components/vaults-list/vaults-list.component';
import { VaultsRoiChartComponent } from './components/vaults-roi-chart/vaults-roi-chart.component';

const pages = [VaultsPage];
const components = [DiversifyVaultsComponent, VaultsListComponent, VaultsRoiChartComponent];

@NgModule({
  declarations: [...pages, ...components],
  exports: [
    VaultsRoiChartComponent
  ],
  imports: [
    CommonModule,
    VaultsRoutingModule,
    SharedModule
  ]
})
export class VaultsModule { }
