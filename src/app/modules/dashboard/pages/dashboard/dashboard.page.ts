import {Component} from '@angular/core';
import {ConnectorService} from '../../../../core/services/connector.service';
import {PoolService} from '../../../../core/services/pool.service';
import {filter, map, shareReplay, tap} from 'rxjs/operators';
import {IBasketHistoricRoi, Token, TokenBalance} from '../../../../core/models/types';
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
  showTransactions: any;
  getPortfolio$: Observable<unknown>;
  public roiData: number[][];

  constructor(private readonly connectorService: ConnectorService,
              private readonly poolService: PoolService,
              private readonly uniswapService: UniswapService,
              private readonly chartsService: ChartsService,
              public readonly apiService: ApiService,
              private readonly charts: ChartsService) {

    const address$ = this.connectorService.providerUserInfo$.pipe(
      filter(v => !!v),
      map(value => value.address),
      shareReplay(1)
    );
    this.transactions$ = address$.pipe(
      switchMap((address) => this.apiService.getTransactions(address)),
      shareReplay(1)
    );
    this.getPortfolio$ = address$.pipe(
      switchMap((address) => this.apiService.getPortfolio(address)),
      shareReplay(1),
      tap((data) => {
        this.getHistoricData(data.tokens);
      })
    );
    this.tokenBalance$ = address$.pipe(
      switchMap(address => this.getTokenBalances(address)),
      map((balance) => {
        if (!balance || !balance.tokens.length) {
          return null;
        }
        balance.tokens = balance.tokens.filter(token => !!token.balance)
          .sort((t1: Token, t2: Token) => {
            let bal1 = t1.quote_rate * t1.balance
            let bal2 = t2.quote_rate * t2.balance
            return bal2 - bal1;
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

  public setDefaultImage(imgIdx: number) {
    document.getElementById(`img-${imgIdx}`)
      .setAttribute('src', 'assets/images/image-missing.png');
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
  getHistoricData(assets) {
    let payload = {};
    assets.forEach(asset => {
      if (asset.contract_ticker_symbol !== 'DFIO' && asset.contract_ticker_symbol !== 'REEF')
      payload[asset.contract_ticker_symbol] = 100 / assets.length;
    });
    console.log(payload);
    return this.apiService.getHistoricRoi(payload, 1).subscribe((historicRoi: IBasketHistoricRoi) => {
      this.roiData = this.charts.composeHighChart(this.extractRoi(historicRoi));
    });
  }
  private extractRoi(obj: IBasketHistoricRoi): number[][] {
    return Object.keys(obj).map((key) => [new Date(key).getTime(), +obj[key].weighted_roi.toFixed(2)]);
  }
}
