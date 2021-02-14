import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import {
  IPendingTransactions,
  IProviderUserInfo,
  IReefPricePerToken,
  PendingTransaction,
  Token,
  TokenSymbol,
} from '../../../../core/models/types';
import { ApiService } from '../../../../core/services/api.service';
import { ConnectorService } from '../../../../core/services/connector.service';
import { filter, map, shareReplay, switchMap, takeUntil } from 'rxjs/operators';
import {
  BehaviorSubject,
  combineLatest,
  Observable,
  ReplaySubject,
} from 'rxjs';
import { PoolService } from '../../../../core/services/pool.service';
import { UniswapService } from '../../../../core/services/uniswap.service';
import { NgDestroyableComponent } from '../../../../shared/ng-destroyable-component';
import { TokenUtil } from '../../../../shared/utils/token.util';

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
  supportedTokensSub = new BehaviorSubject<
    { tokenSymbol: TokenSymbol; src: string }[]
  >([]);
  selTokenSub = new ReplaySubject<TokenSymbol>();
  tokenAmountSub = new BehaviorSubject<number>(null);
  ethPrice$: Observable<number>;
  TokenUtil = TokenUtil;

  constructor(
    public connectorService: ConnectorService,
    public apiService: ApiService,
    public poolService: PoolService,
    public uniswapService: UniswapService
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
        this.apiService.getTokenBalance$(uInfo.address, tokenSymbol)
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
    const tokenLivePrices$: Observable<
      IReefPricePerToken[]
    > = this.supportedTokensSub.pipe(
      filter((v) => !!v.length),
      switchMap((supportedTkns) => {
        const supportedTokenSymbols = supportedTkns.map((st) => st.tokenSymbol);
        // price for each token symbol
        const supportedPrices$ = combineLatest(
          supportedTokenSymbols.map((ts) =>
            uniswapService.getReefPriceInInterval$(ts)
          )
        );
        return supportedPrices$;
      }),
      shareReplay(1)
    );

    this.selectedTokenPrice$ = combineLatest([
      this.selTokenSub,
      this.tokenAmountSub,
      tokenLivePrices$,
    ]).pipe(
      map((value) => {
        const tokenSymbol: TokenSymbol = value[0];
        const amount: number = value[1];
        const tokenPrices: IReefPricePerToken[] = value[2];
        const selectedPrice = tokenPrices.find(
          (tp) => tp.tokenSymbol === tokenSymbol
        );
        return UniswapService.tokenMinAmountCalc(selectedPrice, amount);
      }),
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
