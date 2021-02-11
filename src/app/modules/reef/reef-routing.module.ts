import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ReefPage} from './pages/reef/reef.page';
import {PoolPage} from './pages/pool/pool.page';
import {FarmPage} from './pages/farm/farm.page';
import {FarmsPage} from './pages/farms/farms.page';
import {PoolsPage} from './pages/pools/pools.page';
import {ReefMenuPage} from './pages/reef-menu/reef-menu.page';
import {CardPage} from './pages/card/card.page';
import {BondsPage} from './pages/bonds/bonds.page';
import {BondPage} from './pages/bond/bond.page';
import {AboutPage} from './pages/about/about.page';

const routes: Routes = [
  {
    path: '',
    component: ReefMenuPage,
  },
  {
    path: 'buy',
    component: ReefPage,
  },
  {
    path: 'farms',
    component: FarmsPage,
  },
  {
    path: 'bonds',
    component: BondsPage,
  },
  {
    path: 'pools',
    component: PoolsPage,
  },
  {
    path: 'pool/:token',
    component: PoolPage,
  },
  {
    path: 'farm/:address',
    component: FarmPage,
  },
  {
    path: 'bond/:id',
    component: BondPage,
  },
  {
    path: 'card',
    component: CardPage,
  },
  {
    path: 'about',
    component: AboutPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReefRoutingModule {}
