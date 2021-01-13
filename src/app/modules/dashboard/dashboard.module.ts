import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {DashboardRoutingModule} from './dashboard-routing.module';
import {DashboardPage} from './pages/dashboard/dashboard.page';
import {SharedModule} from '../../shared/shared.module';
import {SettingsPage} from './pages/settings/settings.page';
import {AssetDistributionChartComponent} from './components/asset-distribution-chart/asset-distribution-chart.component';


@NgModule({
  declarations: [DashboardPage, SettingsPage, AssetDistributionChartComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    SharedModule
  ]
})
export class DashboardModule {
}
