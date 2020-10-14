import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReefRoutingModule } from './reef-routing.module';
import { ReefPage } from './pages/reef/reef.page';
import { SharedModule } from '../../shared/shared.module';
import { BuyReefComponent } from './components/buy-reef/buy-reef.component';
import { StakeReefComponent } from './components/stake-reef/stake-reef.component';

const components = [BuyReefComponent, StakeReefComponent];
const pages = [ReefPage];

@NgModule({
  declarations: [...pages, ...components],
  imports: [
    CommonModule,
    ReefRoutingModule,
    SharedModule,
  ]
})
export class ReefModule { }
