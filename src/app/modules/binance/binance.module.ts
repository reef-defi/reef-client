import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BinanceRoutingModule } from './binance-routing.module';
import { BuyCryptoPage } from './pages/buy-crypto/buy-crypto.page';
import { SharedModule } from '../../shared/shared.module';
import { BinanceRegisterModalComponent } from './components/binance-register-modal/binance-register-modal.component';

const pages = [BuyCryptoPage];
const components = [BinanceRegisterModalComponent];

@NgModule({
  declarations: [...pages, ...components],
  imports: [CommonModule, BinanceRoutingModule, SharedModule],
})
export class BinanceModule {}
