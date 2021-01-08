import {Component, OnInit} from '@angular/core';
import {ConnectorService} from '../../../../core/services/connector.service';
import {PoolService} from '../../../../core/services/pool.service';
import {first} from 'rxjs/operators';
import {IProviderUserInfo, ITransaction} from '../../../../core/models/types';
import {Observable} from 'rxjs';
import {UniswapService} from '../../../../core/services/uniswap.service';
import {ApiService} from '../../../../core/services/api.service';
import {ChartsService} from "../../../../core/services/charts.service";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss']
})
export class DashboardPage implements OnInit {
  Object = Object;
  readonly providerName$ = this.connectorService.currentProviderName$;
  readonly provider$ = this.connectorService.currentProvider$;
  readonly providerUserInfo$ = this.connectorService.providerUserInfo$;
  readonly ethPrice$ = this.poolService.getEthPrice();
  readonly transactionsForAccount$: Observable<ITransaction[]> =
    this.connectorService.transactionsForAccount$;
  readonly gasPrices$ = this.apiService.gasPrices$;
  readonly selectedGas$ = this.connectorService.selectedGasPrice$;
  public transactions$;
  public tokens;
  public pieChartData;

  constructor(private readonly connectorService: ConnectorService,
              private readonly poolService: PoolService,
              private readonly uniswapService: UniswapService,
              private readonly apiService: ApiService,
              private readonly chartsService: ChartsService) {
  }

  ngOnInit(): void {
    this.providerUserInfo$.pipe(
      first(ev => !!ev)
    ).subscribe((res: IProviderUserInfo) => {
      console.log(res, 'hmmmm')
      this.transactions$ = this.getTransactionsForAccount(res.address);
      this.getTokenBalances(res.address);
    });
  }

  public setSlippage(percent: string): void {
    this.uniswapService.setSlippage(percent);
  }

  public setGas(type: string, price: number): void {
    this.connectorService.setSelectedGas(type, price);
  }

  private getTransactionsForAccount(address: string): any {
    return this.apiService.getTransactions(address);
  }

  private getTokenBalances(address: string) {
    return this.apiService.getTokenBalances$(address).subscribe(data => {
      this.tokens = data;
      const total = data.totalBalance;
      const pairs = data.tokens.map(({ contract_ticker_symbol, quote }) => [contract_ticker_symbol, (quote / total) * 100]);
      this.pieChartData = this.chartsService.composePieChart(pairs);
    });
  }

  private getPricing() {
    this.apiService.getReefPricing('2020-12-30', '2021-01-06').subscribe(console.log)
  }
}
