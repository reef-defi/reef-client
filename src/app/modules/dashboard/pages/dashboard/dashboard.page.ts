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
  public tokenBalance$: Observable<TokenBalance>;
  public pieChartData;
  public pieChartData$: Observable<any>;

  constructor(private readonly connectorService: ConnectorService,
              private readonly poolService: PoolService,
              private readonly uniswapService: UniswapService,
              private readonly chartsService: ChartsService,
              public readonly apiService: ApiService) {

    const address$ = this.connectorService.providerUserInfo$.pipe(
      filter(v => !!v),
      map(value => value.address),
      shareReplay(1)
    );
    this.transactions$ = address$.pipe(
      switchMap((address) => this.apiService.getTransactions(address)),
      shareReplay(1)
    );
    this.tokenBalance$ = address$.pipe(
      switchMap(address => this.getTokenBalances(address)),
      map((balance) => {
        if (!balance || !balance.tokens.length) {
          return null;
        }
        balance.tokens = balance.tokens.filter(token => !!token.balance)
          .sort((t1: Token, t2: Token) => {
            return t2.balance - t1.balance;
          });
        return balance;
      }),
      shareReplay(1)
    );

    this.pieChartData$ = this.tokenBalance$.pipe(
      map(tokenBalance => {
        if (!tokenBalance.tokens || !tokenBalance.tokens.length) {
          return null;
        }
        let other = 0;
        const total = tokenBalance.totalBalance;
        const pairs = tokenBalance.tokens
          .map(({ contract_ticker_symbol, quote }) => [contract_ticker_symbol, (quote / total) * 100])
          .map(([name, percent]: [string, number]) => {
            if (percent < 1) {
              other += percent
            }
            return [name, percent];
          })
          .filter(([_, percent]) => percent >= 1);
        const unified = [...pairs, ['Other', other]];
        return this.chartsService.composePieChart(unified);
      }),
      shareReplay(1)
    );

  }

  private getTokenBalances(address: string): Observable<TokenBalance> {
    return this.apiService.getTokenBalances$(address).pipe(
      map(tokens => ({
          address,
          tokens,
          totalBalance: tokens.reduce((acc, curr) => acc + curr.quote, 0)
        } as TokenBalance
      ))
    );
  }
}
