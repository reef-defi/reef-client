import { AfterViewInit, ChangeDetectorRef, Component } from '@angular/core';
import { ConnectorService } from '../../../../core/services/connector.service';
import { PoolService } from '../../../../core/services/pool.service';
import {
  catchError,
  distinctUntilChanged,
  filter,
  map,
  shareReplay,
  tap,
} from 'rxjs/operators';
import {
  IBasketHistoricRoi,
  IPortfolio,
  SupportedPortfolio,
  Token,
  TokenBalance,
} from '../../../../core/models/types';
import { BehaviorSubject, EMPTY, Observable, Subject } from 'rxjs';
import { UniswapService } from '../../../../core/services/uniswap.service';
import { ApiService } from '../../../../core/services/api.service';
import { ChartsService } from '../../../../core/services/charts.service';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { totalmem } from 'os';
import { combineLatest } from 'rxjs/internal/observable/combineLatest';
import { TokenBalanceService } from '../../../../shared/service/token-balance.service';
import { first } from 'rxjs/internal/operators/first';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements AfterViewInit {
  Object = Object;
  public transactions$;
  public tokenBalance$: Observable<TokenBalance>;
  public portfolioTotalBalance$: Observable<{ totalBalance: number }>;
  public pieChartData$: Observable<any>;
  public portfolioError$ = new BehaviorSubject<boolean>(false);
  showTransactions: boolean;
  portfolio$: Observable<SupportedPortfolio>;
  getPortfolio2$: Observable<any>;
  public roiData: number[][];

  private triggerPortfolio = new Subject();

  constructor(
    private readonly connectorService: ConnectorService,
    private readonly poolService: PoolService,
    private readonly uniswapService: UniswapService,
    private readonly chartsService: ChartsService,
    public readonly apiService: ApiService,
    private readonly charts: ChartsService,
    private readonly cdRef: ChangeDetectorRef,
    private readonly tokenBalanceService: TokenBalanceService
  ) {
    const address$ = this.connectorService.providerUserInfo$.pipe(
      first((v) => !!v),
      map((value) => value.address),
      shareReplay(1)
    );
    this.transactions$ = address$.pipe(
      switchMap((address) => this.apiService.getTransactions(address)),
      shareReplay(1)
    );

    this.portfolio$ = this.triggerPortfolio.pipe(
      tap(() => {
        this.portfolioError$.next(false);
      }),
      switchMap(() => {
        return address$.pipe(
          switchMap((address: string) =>
            this.tokenBalanceService.getPortfolio(address)
          ),
          tap((data) => {
            console.log('PORTFOLIO DATA=', data);
            this.getHistoricData(data.tokens);
          })
        );
      }),
      catchError((err) => {
        this.portfolioError$.next(true);
        return EMPTY;
      }),
      shareReplay(1)
    );

    this.portfolioTotalBalance$ = this.portfolio$.pipe(
      map((portfolio: SupportedPortfolio) => {
        const totalBalance = Object.keys(portfolio)
          .map((key: string) => {
            const portfolioPositions = portfolio[key];
            if (
              key === 'uniswapPositions' &&
              Array.isArray(portfolioPositions)
            ) {
              return portfolioPositions.reduce(
                (a, c) => a + c.pool_token.quote,
                0
              );
            }
            if (Array.isArray(portfolioPositions)) {
              return portfolioPositions.reduce((a, c) => a + c.quote, 0);
            }
            return 0;
          })
          .reduce((a, c) => a + c);
        return { totalBalance };
      })
    );

    this.tokenBalance$ = address$.pipe(
      switchMap((address) => this.getTokenBalances(address)),
      map((balance) => {
        if (!balance) {
          return null;
        }
        balance.tokens = balance.tokens
          .filter((token) => !!token.balance)
          .sort((t1: Token, t2: Token) => {
            let bal1 = t1.quote_rate * t1.balance;
            let bal2 = t2.quote_rate * t2.balance;
            return bal2 - bal1;
          });
        return balance;
      }),
      shareReplay(1)
    );

    this.pieChartData$ = combineLatest(
      this.portfolio$,
      this.portfolioTotalBalance$
    ).pipe(
      map(
        ([portfolio, { totalBalance }]: [
          SupportedPortfolio,
          { [key: string]: number }
        ]) => {
          if (
            !portfolio.tokens ||
            !Array.isArray(portfolio.tokens) ||
            !totalBalance
          ) {
            return null;
          }
          let other = 0;
          const total = totalBalance;
          const pairs = portfolio.tokens
            .map(({ contract_ticker_symbol, quote }) => [
              contract_ticker_symbol,
              (quote / total) * 100,
            ])
            .map(([name, percent]: [string, number]) => {
              if (percent < 1) {
                other += percent;
              }
              return [name, percent];
            })
            .filter(([_, percent]) => percent >= 1);
          let unified = pairs;
          if (other > 0) {
            unified = [...pairs, ['Other', other]];
          }
          console.log(unified, 'UNIFIED');
          return this.chartsService.composePieChart(unified);
        }
      ),
      shareReplay(1)
    );
  }

  ngAfterViewInit() {
    this.triggerPortfolio.next();
  }

  public setDefaultImage(imgIdx: number) {
    document
      .getElementById(`img-${imgIdx}`)
      .setAttribute('src', 'assets/images/image-missing.png');
  }

  public getPortfolio() {
    this.portfolioError$.next(false);
    this.cdRef.detectChanges();
    setTimeout(() => this.triggerPortfolio.next(), 1000);
    this.triggerPortfolio.next();
  }

  private getTokenBalances(address: string): Observable<TokenBalance> {
    return this.tokenBalanceService.getTokenBalances$(address).pipe(
      map(
        (tokens) =>
          ({
            address,
            tokens,
            totalBalance: tokens.reduce((acc, curr) => acc + curr.quote, 0),
          } as TokenBalance)
      ),
      tap((v) => console.log('BBBB===', v))
    );
  }

  getHistoricData(assets) {
    let payload = {};
    assets.forEach((asset) => {
      if (
        asset.contract_ticker_symbol !== 'DFIO' &&
        asset.contract_ticker_symbol !== 'REEF'
      ) {
        payload[asset.contract_ticker_symbol] = 100 / assets.length;
      }
    });
    return this.apiService
      .getHistoricRoi(payload, 1)
      .subscribe((historicRoi: IBasketHistoricRoi) => {
        this.roiData = this.charts.composeHighChart(
          this.extractRoi(historicRoi)
        );
      });
  }

  private extractRoi(obj: IBasketHistoricRoi): number[][] {
    return Object.keys(obj).map((key) => [
      new Date(key).getTime(),
      +obj[key].weighted_roi.toFixed(2),
    ]);
  }
}
