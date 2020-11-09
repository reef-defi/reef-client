import { Component, OnInit } from '@angular/core';
import { UniswapService } from '../../../../core/services/uniswap.service';

@Component({
  selector: 'app-stake-reef-page',
  templateUrl: './pools.page.html',
  styleUrls: ['./pools.page.scss']
})
export class PoolsPage implements OnInit {

  constructor(private readonly uniswapService: UniswapService) {
  }

  ngOnInit(): void {
  }

  getPair(tokenSymbol: string, reefAmount: string, tokenBAmount: string): any {
    const pair = this.uniswapService.getReefPairWith(tokenSymbol, reefAmount, tokenBAmount);
  }

  async getReefPricePer(tokenSymbol: string) {
    const price = await this.uniswapService.getReefPricePer(tokenSymbol);
  }

}
