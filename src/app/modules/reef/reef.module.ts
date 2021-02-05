import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReefRoutingModule } from './reef-routing.module';
import { ReefPage } from './pages/reef/reef.page';
import { SharedModule } from '../../shared/shared.module';
import { BuyReefComponent } from './components/buy-reef/buy-reef.component';
import { StakeReefComponent } from './components/stake-reef/stake-reef.component';
import { PoolPage } from './pages/pool/pool.page';
import { FarmPage } from './pages/farm/farm.page';
import { ReefMenuPage } from './pages/reef-menu/reef-menu.page';
import { FarmsPage } from './pages/farms/farms.page';
import { PoolsPage } from './pages/pools/pools.page';
import { ReefHistoricPriceComponent } from './components/reef-historic-price/reef-historic-price.component';
import { CardPage } from './pages/card/card.page';

const components = [BuyReefComponent, StakeReefComponent];
const pages = [
  ReefPage,
  FarmsPage,
  PoolPage,
  FarmsPage,
  FarmPage,
  ReefMenuPage,
  PoolsPage,
];

@NgModule({
  declarations: [...pages, ...components, ReefHistoricPriceComponent, CardPage],
  imports: [CommonModule, ReefRoutingModule, SharedModule],
})
export class ReefModule {}
