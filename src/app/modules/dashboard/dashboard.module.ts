import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardPage } from './pages/dashboard/dashboard.page';
import { SharedModule } from '../../shared/shared.module';
import { SettingsPage } from './pages/settings/settings.page';
import { AssetDistributionChartComponent } from './components/asset-distribution-chart/asset-distribution-chart.component';
import { HoldingsTableComponent } from './components/holdings-table/holdings-table.component';
import { PortfolioPositionsComponent } from './components/holdings-table/portfolio-positions/portfolio-positions.component';

@NgModule({
  declarations: [
    DashboardPage,
    SettingsPage,
    AssetDistributionChartComponent,
    HoldingsTableComponent,
    PortfolioPositionsComponent,
  ],
  imports: [CommonModule, DashboardRoutingModule, SharedModule],
})
export class DashboardModule {}
