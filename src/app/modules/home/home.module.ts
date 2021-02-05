import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomePage } from './pages/home/home.page';
import { DisclaimerModalComponent } from './components/disclaimer-modal/disclaimer-modal.component';
import { SharedModule } from '../../shared/shared.module';
import { MatRippleModule } from '@angular/material/core';

const components = [DisclaimerModalComponent];
const pages = [HomePage];

@NgModule({
  declarations: [...pages, ...components],
  imports: [CommonModule, HomeRoutingModule, SharedModule, MatRippleModule],
})
export class HomeModule {}
