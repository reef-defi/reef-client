import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardPage } from './pages/dashboard/dashboard.page';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
  declarations: [DashboardPage],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    SharedModule
  ]
})
export class DashboardModule { }
