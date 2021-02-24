import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';
import { ConnectorService } from '../../../../core/services/connector.service';
import { PoolService } from '../../../../core/services/pool.service';
import { filter, map, shareReplay, take, tap } from 'rxjs/operators';
import {
  ExchangeId,
  IBasketHistoricRoi,
  IPortfolio,
  SupportedPortfolio,
  Token,
  TokenBalance,
} from '../../../../core/models/types';
import { BehaviorSubject, merge, Observable, Subject } from 'rxjs';
import { UniswapService } from '../../../../core/services/uniswap.service';
import { ApiService } from '../../../../core/services/api.service';
import { ChartsService } from '../../../../core/services/charts.service';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { combineLatest } from 'rxjs/internal/observable/combineLatest';
import { TokenBalanceService } from '../../../../shared/service/token-balance.service';
import { first } from 'rxjs/internal/operators/first';
import { scan } from 'rxjs/internal/operators/scan';
import { DevUtil } from '../../../../shared/utils/dev-util';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  Object = Object;
  public transactions$;
  public tokenBalance$: Observable<TokenBalance>;
  public portfolioTotalBalance$: Observable<{ totalBalance: number }>;
  public pieChartData$: Observable<any>;
  public portfolioError$ = new BehaviorSubject<boolean>(false);
  showTransactions: boolean;
  portfolio$: Observable<IPortfolio>;
  getPortfolio2$: Observable<any>;
  public roiData: number[][];

  private triggerPortfolio = new Subject();

  constructor(
    public readonly connectorService: ConnectorService,
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

    const portfolioPositions$ = address$.pipe(
      map((addr) => this.tokenBalanceService.getPortfolioObservables(addr)),
      shareReplay(1)
    );

    // Init portfolio positions
    portfolioPositions$
      .pipe(
        take(1),
        switchMap(
          (portfolio: {
            refreshSubject: Subject<ExchangeId>;
            positions: Map<ExchangeId, Observable<any>>;
          }) => {
            setTimeout((_) => portfolio.refreshSubject.next(ExchangeId.TOKENS));
            const uniPositionsPortfolio$ = portfolio.positions
              .get(ExchangeId.TOKENS)
              .pipe(
                filter((v) => !!v),
                take(1),
                tap((_) => {
                  portfolio.refreshSubject.next(ExchangeId.UNISWAP_V2);
                })
              );
            const compPositionsPortfolio$ = uniPositionsPortfolio$.pipe(
              filter((v) => !!v),
              take(1),
              tap((_) => {
                portfolio.refreshSubject.next(ExchangeId.COMPOUND);
              })
            );

            return merge(uniPositionsPortfolio$);//, compPositionsPortfolio$);
          }
        )
      )
      .subscribe();

    this.portfolio$ = portfolioPositions$.pipe(
      switchMap(
        (portfolio: {
          refreshSubject: Subject<ExchangeId>;
          positions: Map<ExchangeId, Observable<any>>;
        }) => {
          const tokens$ = portfolio.positions.get(ExchangeId.TOKENS).pipe(
            tap((data) => {
              if (data && data.length) {
                this.getHistoricData(data);
              }
            }),
            map((v) => ({ tokens: v }))
          );
          const uni$ = portfolio.positions
            .get(ExchangeId.UNISWAP_V2)
            .pipe(map((v) => ({ uniswapPositions: v })));
          /*const comp$ = portfolio.positions
            .get(ExchangeId.COMPOUND)
            .pipe(map((v) => ({ compoundPositions: v })));*/
          return merge(tokens$, uni$, /*comp$*/).pipe(
            map(
              (positionVal) =>
                ({
                  ...positionVal,
                  refreshSubject: portfolio.refreshSubject,
                } as IPortfolio)
            )
          );
        }
      ),
      scan((combinedPortfolio, currVal: IPortfolio) => {
        const currValExchanges = Object.keys(currVal);
        currValExchanges.forEach((exKey) => {
          combinedPortfolio[exKey] = currVal[exKey];
        });
        return combinedPortfolio;
      }, {} as IPortfolio),
      shareReplay(1)
    );

    this.portfolioTotalBalance$ = this.portfolio$.pipe(
      map((portfolio: SupportedPortfolio) => {
        const totalBalance = Object.keys(portfolio)
          .map((key: string) => {
            const portfolioPositions = portfolio[key];
            if (
              // TODO remove string keywords - use enum like ExchangeId
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
          return this.makeChart(portfolio, totalBalance);
        }
      ),
      shareReplay(1)
    );
  }

  public setDefaultImage(imgIdx: number) {
    document
      .getElementById(`img-${imgIdx}`)
      .setAttribute('src', 'assets/images/image-missing.png');
  }

  /*public getPortfolio() {
    this.portfolioError$.next(false);
    this.cdRef.detectChanges();
    setTimeout(() => this.triggerPortfolio.next(), 1000);
    this.triggerPortfolio.next();
  }*/

  private getTokenBalances(address: string): Observable<TokenBalance> {
    return this.tokenBalanceService.getTokenBalances$(address).pipe(
      map(
        (tokens) =>
          ({
            address,
            tokens,
            totalBalance: tokens.reduce((acc, curr) => acc + curr.quote, 0),
          } as TokenBalance)
      )
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

  private makeChart(portfolio: SupportedPortfolio, totalBalance: number) {
    let defiPositions = [];
    if (
      Array.isArray(portfolio.uniswapPositions) &&
      portfolio.uniswapPositions.length > 0
    ) {
      const poolTokens = portfolio.uniswapPositions.map((p) => p.pool_token);
      defiPositions.push(...poolTokens);
    }
    if (
      Array.isArray(portfolio.compoundPositions) &&
      portfolio.compoundPositions.length > 0
    ) {
      defiPositions.push(...portfolio.compoundPositions);
    }
    let other = 0;
    const total = totalBalance;
    const all = [...(portfolio.tokens as Token[]), ...defiPositions];
    const pairs = all
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
    return this.chartsService.composePieChart(unified);
  }
}
