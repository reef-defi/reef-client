import {Component} from '@angular/core';
import {ConnectorService} from '../../../../core/services/connector.service';
import {PoolService} from '../../../../core/services/pool.service';
import {filter, map, shareReplay} from 'rxjs/operators';
import {Token, TokenBalance} from '../../../../core/models/types';
import {Observable} from 'rxjs';
import {UniswapService} from '../../../../core/services/uniswap.service';
import {ApiService} from '../../../../core/services/api.service';
import {ChartsService} from '../../../../core/services/charts.service';
import {switchMap} from 'rxjs/internal/operators/switchMap';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss']
})
export class DashboardPage {
  Object = Object;
  public transactions$;
  public tokens$: Observable<TokenBalance>;
  public pieChartData;
  public pieChartData$: Observable<any>;

  constructor(private readonly connectorService: ConnectorService,
              private readonly poolService: PoolService,
              private readonly uniswapService: UniswapService,
              private readonly apiService: ApiService,
              private readonly chartsService: ChartsService) {
    const address$ = this.connectorService.providerUserInfo$.pipe(
      filter(v => !!v),
      map(value => value.address),
      shareReplay(1)
    );
    this.transactions$ = address$.pipe(
      switchMap((address) => this.getTransactionsForAccount(address)),
      shareReplay(1)
    );
    this.tokens$ = address$.pipe(
      switchMap(address => this.getTokenBalances(address)),
      map((balance) => {
        balance.tokens = balance.tokens.filter(token => !!token.balance)
          .sort((t1: Token, t2: Token) => {
            return t2.balance - t1.balance;
          });
        return balance;
      }),
      shareReplay(1)
    );

    this.pieChartData$ = this.tokens$.pipe(
      map(tokens => {
        const total = tokens.totalBalance;
        const pairs = tokens.tokens.map(({
                                           contract_ticker_symbol,
                                           quote
                                         }) => [contract_ticker_symbol, (quote / total) * 100]);
        return this.chartsService.composePieChart(pairs);
      }),
      shareReplay(1)
    );

  }

  /*ngOnInit(): void {
    this.providerUserInfo$.pipe(
      first(ev => !!ev)
    ).subscribe((res: IProviderUserInfo) => {
      console.log(res, 'hmmmm')
      this.transactions$ = this.getTransactionsForAccount(res.address);
      this.getTokenBalances(res.address);
    });
  }*/

  public setSlippage(percent: string): void {
    this.uniswapService.setSlippage(percent);
  }

  public setGas(type: string, price: number): void {
    this.connectorService.setSelectedGas(type, price);
  }

  private getTransactionsForAccount(address: string): any {
    return this.apiService.getTransactions(address);
  }

  private getTokenBalances(address: string): Observable<TokenBalance> {
    return this.apiService.getTokenBalances$(address).pipe(
      map(tokens => ({
          tokens,
          totalBalance: tokens.reduce((acc, curr) => acc + curr.quote, 0)
        } as TokenBalance
      ))
    );
  }
}
