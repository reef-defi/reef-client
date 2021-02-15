import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output,} from '@angular/core';
import {IProviderUserInfo, IReefPricePerToken, PendingTransaction, Token, TokenSymbol,} from '../../../../core/models/types';
import {ApiService} from '../../../../core/services/api.service';
import {ConnectorService} from '../../../../core/services/connector.service';
import {filter, map, mapTo, shareReplay, switchMap, takeUntil} from 'rxjs/operators';
import {BehaviorSubject, combineLatest, Observable, ReplaySubject, Subject, timer,} from 'rxjs';
import {PoolService} from '../../../../core/services/pool.service';
import {UniswapService} from '../../../../core/services/uniswap.service';
import {NgDestroyableComponent} from '../../../../shared/ng-destroyable-component';
import {TokenUtil} from '../../../../shared/utils/token.util';
import {TokenBalanceService} from '../../../../shared/service/token-balance.service';
import {tap} from 'rxjs/internal/operators/tap';

@Component({
  selector: 'app-buy-reef',
  templateUrl: './buy-reef.component.html',
  styleUrls: ['./buy-reef.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuyReefComponent extends NgDestroyableComponent {
  private static ETH_PRICE_INTERVAL = 60000;

  @Input() pendingTransactions: Observable<PendingTransaction[]> | undefined;

  @Input()
  set supportedTokens(val: { tokenSymbol: TokenSymbol; src: string }[]) {
    this.supportedTokensSub.next(val);
    this.selTokenSub.next(val[0].tokenSymbol);
  }

  @Input() loading: boolean | undefined;
  @Output() buy = new EventEmitter<{
    tokenSymbol: TokenSymbol;
    tokenAmount: number;
    amountOutMin: number;
  }>();

  TokenSymbol = TokenSymbol;
  selectedTokenBalance$: Observable<Token>;
  selectedTokenPrice$: Observable<IReefPricePerToken>;
  supportedTokensSub = new BehaviorSubject<{ tokenSymbol: TokenSymbol; src: string }[]>([]);
  selTokenSub = new ReplaySubject<TokenSymbol>();
  tokenAmountSub = new BehaviorSubject<number>(null);
  ethPrice$: Observable<number>;
  TokenUtil = TokenUtil;

  constructor(
    public connectorService: ConnectorService,
    public apiService: ApiService,
    public poolService: PoolService,
    public uniswapService: UniswapService,
    public tokenBalanceService: TokenBalanceService
  ) {
    super();
    this.ethPrice$ = this.poolService.ethPrice$.pipe(
      map((data) => data.ethereum.usd)
    );

    this.selectedTokenBalance$ = combineLatest([
      this.selTokenSub,
      this.connectorService.providerUserInfo$.pipe(filter((v) => !!v)),
    ]).pipe(
      switchMap(([tokenSymbol, uInfo]: [TokenSymbol, IProviderUserInfo]) =>
        this.tokenBalanceService.getTokenBalance$(uInfo.address, tokenSymbol)
      ),
      shareReplay(1)
    );

    // set token amount value to token balance
    /*this.selectedTokenBalance$.subscribe((tokenBalance: Token) => {
      const bal = tokenBalance;
      this.tokenAmountSub.next(bal ? this.toMaxDecimalPlaces(bal.balance, 4) : 0);
    });*/
    this.selTokenSub
      .pipe(takeUntil(this.onDestroyed$))
      .subscribe(() => this.tokenAmountSub.next(null));

    // we get all supported token prices in advance
    const selectedTokenLivePrices$
      : Observable<{ price$: Observable<IReefPricePerToken>, refreshSub: Subject<any> }> = this.selTokenSub.pipe(
      map((selToken: TokenSymbol) => uniswapService.getReefPriceInInterval(selToken)),
      shareReplay(1)
    );
    selectedTokenLivePrices$.pipe(
      map(v => v.refreshSub),
      switchMap(v => {
        return timer(0, 3000).pipe(
          takeUntil(this.onDestroyed$),
          mapTo(v)
        );
      }),
      takeUntil(this.onDestroyed$)
    ).subscribe(v => {
      console.log('REMOVE SUBBBB');
      v.next(null);
    });

    const selTokenPrices$ = selectedTokenLivePrices$.pipe(switchMap(v => v.price$));
    this.selectedTokenPrice$ = combineLatest([
      this.tokenAmountSub,
      selTokenPrices$,
    ]).pipe(
      map(([amount, prices]) => UniswapService.tokenMinAmountCalc(prices, amount)),
      tap(v => console.log('GOT PRICE')),
      shareReplay(1)
    );
  }

  hasBalanceForPayment(paymentValue: number, tokenBalance: Token): boolean {
    if (tokenBalance && tokenBalance.balance > 0) {
      return tokenBalance.balance >= paymentValue;
    }
    return false;
  }
}
