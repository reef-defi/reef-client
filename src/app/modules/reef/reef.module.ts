import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReefRoutingModule } from './reef-routing.module';
import { ReefPage } from './pages/reef/reef.page';


@NgModule({
  declarations: [ReefPage],
  imports: [
    CommonModule,
    ReefRoutingModule
  ]
})
export class ReefModule { }
