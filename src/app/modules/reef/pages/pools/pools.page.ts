import { Component, OnInit } from '@angular/core';
import { UniswapService } from '../../../../core/services/uniswap.service';

@Component({
  selector: 'app-stake-reef-page',
  templateUrl: './pools.page.html',
  styleUrls: ['./pools.page.scss']
})
export class PoolsPage  {

  constructor(private readonly uniswapService: UniswapService) {
  }
  pools = [
    {
      name: 'WETH & REEF',
      description: `
      Provide WETH and REEF into this pool to get
      <strong class="font-weight-bold">WETH-REEF</strong>
      LP Tokens`,
      link: 'WETH',
      btnLabel: 'Provide Liquidity into WETH/REEF',
      imgs: [
        'eth.png',
        'reef/reef-token.svg'
      ]
    },
    {
      name: 'USDT & REEF',
      description: `
      Invest USDT and REEF into this pool to get
      <strong class="font-weight-bold">USDT-REEF</strong>
      LP Tokens`,
      link: 'USDT',
      btnLabel: 'Provide Liquidity into USDT/REEF',
      imgs: [
        'usdt.png',
        'reef/reef-token.svg'
      ]
    },
  ]
}
