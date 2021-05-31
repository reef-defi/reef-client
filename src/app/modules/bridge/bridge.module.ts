import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BridgeRoutingModule } from './bridge-routing.module';
import { BridgePage } from './pages/bridge/bridge.page';
import { SharedModule } from '../../shared/shared.module';
import { ConfirmationComponent } from './components/confirmation/confirmation.component';

@NgModule({
  declarations: [BridgePage, ConfirmationComponent],
  imports: [CommonModule, BridgeRoutingModule, SharedModule],
})
export class BridgeModule {}
