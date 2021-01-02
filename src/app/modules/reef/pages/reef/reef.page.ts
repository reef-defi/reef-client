import { Component, OnInit } from '@angular/core';
import { ContractService } from '../../../../core/services/contract.service';
import { ConnectorService } from '../../../../core/services/connector.service';
import { UniswapService } from '../../../../core/services/uniswap.service';
import { PoolService } from '../../../../core/services/pool.service';
import { IReefPricePerToken } from '../../../../core/models/types';

@Component({
  selector: 'app-reef',
  templateUrl: './reef.page.html',
  styleUrls: ['./reef.page.scss']
})
export class ReefPage implements OnInit {
  readonly reefToken$ = this.contractService.reefTokenContract$;
  readonly reefStaking$ = this.contractService.stakingContract$;
  tokenAmount = 1;
  selectedToken = 'WETH';
  tokenPrices: IReefPricePerToken | undefined;
  supportedTokens = [{symbol: 'WETH', src: 'eth.png'}, {symbol: 'USDT', src: 'usdt.png'}];
  ethPrice = 0;
  buyLoading = false;

  constructor(private contractService: ContractService,
              private readonly connectorService: ConnectorService,
              private readonly uniswapService: UniswapService,
              private apiService: PoolService) {
  }

  ngOnInit(): void {
    this.getReefPricePer('WETH', this.tokenAmount);
    this.apiService.getEthPrice().subscribe(data => this.ethPrice = data.ethereum.usd);
  }

  async onTokenChange(tokenSymbol: string): Promise<any> {
    this.tokenPrices = undefined;
    await this.getReefPricePer(tokenSymbol, this.tokenAmount);
  }

  async onAmountChange(amount: number): Promise<any> {
    if (amount && amount > 0) {
      this.tokenPrices = undefined;
      await this.getReefPricePer(this.selectedToken, amount);
    }
  }

  async buyReef(tokenAmount: number): Promise<any> {
    this.buyLoading = true;
    await this.uniswapService.buyReef(this.selectedToken, tokenAmount, 10);
    this.buyLoading = false;
  }

  private async getReefPricePer(tokenSymbol: string, amount: number): Promise<any> {
    this.selectedToken = tokenSymbol;
    this.tokenAmount = amount;
    this.tokenPrices = await this.uniswapService.getReefPricePer(tokenSymbol, amount);
  }
}
