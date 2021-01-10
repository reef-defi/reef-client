import {Component, OnInit} from '@angular/core';
import {ContractService} from '../../../../core/services/contract.service';
import {ConnectorService} from '../../../../core/services/connector.service';
import {UniswapService} from '../../../../core/services/uniswap.service';
import {PoolService} from '../../../../core/services/pool.service';
import {IReefPricePerToken, TokenSymbol} from '../../../../core/models/types';
import {ChartsService} from "../../../../core/services/charts.service";
import {ApiService} from "../../../../core/services/api.service";
import {format, subMonths} from 'date-fns';
import {first} from 'rxjs/operators';

@Component({
  selector: 'app-reef',
  templateUrl: './reef.page.html',
  styleUrls: ['./reef.page.scss']
})
export class ReefPage implements OnInit {
  readonly reefToken$ = this.contractService.reefTokenContract$;
  readonly reefStaking$ = this.contractService.stakingContract$;
  // tokenAmount = 1;
  // selectedToken = 'WETH';
  // tokenPrices: IReefPricePerToken | undefined;
  supportedTokens = [{tokenSymbol: TokenSymbol.WETH, src: 'eth.png'}, {tokenSymbol: TokenSymbol.USDT, src: 'usdt.png'}];

  buyLoading = false;
  reefPriceChartData = null;

  constructor(private contractService: ContractService,
              private readonly connectorService: ConnectorService,
              private readonly uniswapService: UniswapService,
              private readonly poolService: PoolService,
              private readonly chartService: ChartsService,
              private readonly apiService: ApiService) {
  }

  ngOnInit(): void {
    // this.getReefPricePer('WETH', this.tokenAmount);
    // this.poolService.getEthPrice().subscribe(data => this.ethPrice = data.ethereum.usd);
    this.getReefHistoricalPrice();
  }

  /*async onTokenChange(tokenSymbol: string): Promise<any> {
    this.tokenPrices = undefined;
    await this.getReefPricePer(tokenSymbol, this.tokenAmount);
  }

  async onAmountChange(amount: number): Promise<any> {
    if (amount && amount > 0) {
      this.tokenPrices = undefined;
      await this.getReefPricePer(this.selectedToken, amount);
    }
  }*/

  async buyReef(tokenSymbol: string, tokenAmount: number): Promise<any> {
    this.buyLoading = true;
    await this.uniswapService.buyReef(tokenSymbol, tokenAmount, 10);
    this.buyLoading = false;
  }

  public onDateChange(val: number) {
    const endDate = format(new Date(), 'yyyy-MM-dd');
    const startDate = format(subMonths(new Date(), val), 'yyyy-MM-dd');
    this.getReefHistoricalPrice(endDate, startDate);
  }

  /*private async getReefPricePer(tokenSymbol: string, amount: number): Promise<any> {
    this.selectedToken = tokenSymbol;
    this.tokenAmount = amount;
    this.tokenPrices = await this.uniswapService.getLiveReefPricePer$(TokenSymbol[tokenSymbol], amount).pipe(first()).toPromise();
  }*/

  private getReefHistoricalPrice(to?: string, from?: string) {
    if (!from) {
      from = '2020-12-29' // Date Of Reef TGE
    }
    if (!to) {
      to = format(new Date(), 'yyyy-MM-dd');
    }
    this.apiService.getReefPricing(from, to).subscribe(({data}) => {
      this.reefPriceChartData = this.chartService.composeHighChart(data.prices.map(obj => [new Date(obj.date).getTime(), obj.price]), true);
    })
  }

}
