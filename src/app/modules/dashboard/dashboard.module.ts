import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardPage } from './pages/dashboard/dashboard.page';
import { SharedModule } from '../../shared/shared.module';
import { SettingsPage } from './pages/settings/settings.page';


@NgModule({
  declarations: [DashboardPage, SettingsPage],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    SharedModule
  ]
})
export class DashboardModule { }
