import { Component } from '@angular/core';
import { UniswapService } from '../../../../core/services/uniswap.service';

@Component({
  selector: 'app-stake-reef-page',
  templateUrl: './pools.page.html',
  styleUrls: ['./pools.page.scss'],
})
export class PoolsPage {
  constructor(private readonly uniswapService: UniswapService) {}
  pools = [
    {
      name: 'ETH & REEF',
      description: `
      Provide ETH and REEF into this pool to get
      <strong class="font-weight-bold">ETH-REEF</strong>
      LP Tokens`,
      link: 'ETH',
      btnLabel: 'Provide Liquidity into ETH/REEF',
      imgs: ['eth.png', 'reef/reef-token.svg'],
    },
    {
      name: 'USDT & REEF',
      description: `
      Invest USDT and REEF into this pool to get
      <strong class="font-weight-bold">USDT-REEF</strong>
      LP Tokens`,
      link: 'USDT',
      btnLabel: 'Provide Liquidity into USDT/REEF',
      imgs: ['usdt.png', 'reef/reef-token.svg'],
    },
  ];
}
