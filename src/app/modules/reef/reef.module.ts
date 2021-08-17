import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

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
import { BondsPage } from './pages/bonds/bonds.page';
import { BondPage } from './pages/bond/bond.page';
import { AboutPage } from './pages/about/about.page';
import { CardAdminPage } from './pages/card-admin-page/card-admin-page';

const components = [
  BuyReefComponent,
  StakeReefComponent,
  ReefHistoricPriceComponent,
];
const pages = [
  ReefPage,
  FarmsPage,
  PoolPage,
  FarmsPage,
  FarmPage,
  ReefMenuPage,
  PoolsPage,
  CardPage,
  BondsPage,
  BondPage,
  AboutPage,
];

@NgModule({
  declarations: [...pages, ...components, CardAdminPage],
  imports: [CommonModule, ReefRoutingModule, SharedModule],
  providers: [DatePipe],
})
export class ReefModule {}
