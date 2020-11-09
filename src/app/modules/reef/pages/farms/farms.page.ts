import { Component, OnInit } from '@angular/core';
import { ContractService } from '../../../../core/services/contract.service';
import { UniswapService } from '../../../../core/services/uniswap.service';
import { addresses } from '../../../../../assets/addresses';

@Component({
  selector: 'app-farm-reef',
  templateUrl: './farms.page.html',
  styleUrls: ['./farms.page.scss']
})
export class FarmsPage implements OnInit {
  readonly REEF_WETH_POOL = addresses.REEF_WETH_POOL;
  readonly REEF_USDT_POOL = addresses.REEF_USDT_POOL;

  constructor(private readonly contractService: ContractService,
              private readonly uniswapService: UniswapService,) {
  }

  ngOnInit(): void {
  }

}
