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

}
