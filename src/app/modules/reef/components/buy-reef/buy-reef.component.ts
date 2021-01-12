import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {IProviderUserInfo, IReefPricePerToken, Token, TokenSymbol} from '../../../../core/models/types';
import {ApiService} from '../../../../core/services/api.service';
import {ConnectorService} from '../../../../core/services/connector.service';
import {filter, map, shareReplay, skipUntil, switchMap, take, tap, withLatestFrom} from 'rxjs/operators';
import {BehaviorSubject, combineLatest, Observable, ReplaySubject} from 'rxjs';
import {PoolService} from '../../../../core/services/pool.service';
import {UniswapService} from '../../../../core/services/uniswap.service';

@Component({
  selector: 'app-buy-reef',
  templateUrl: './buy-reef.component.html',
  styleUrls: ['./buy-reef.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuyReefComponent {
  private static ETH_PRICE_INTERVAL = 60000;
  @Input()
  set supportedTokens(val: { tokenSymbol: TokenSymbol, src: string }[]) {
    this.supportedTokensSub.next(val);
    this.selTokenSub.next(val[0].tokenSymbol);
  };

  @Input() loading: boolean | undefined;
  @Output() buy = new EventEmitter<{ tokenSymbol: string, tokenAmount: number }>();

  TokenSymbol = TokenSymbol;
  selectedTokenBalances$: Observable<Token[]>;
  selectedTokenPrice$: Observable<IReefPricePerToken>;
  supportedTokensSub = new BehaviorSubject<{ tokenSymbol: TokenSymbol, src: string }[]>([]);
  selTokenSub = new ReplaySubject<TokenSymbol>();
  tokenAmountSub = new BehaviorSubject<number>(0);
  ethPrice$: Observable<number>;

  constructor(
    public connectorService: ConnectorService,
    public apiService: ApiService,
    public poolService: PoolService,
    public uniswapService: UniswapService
  ) {

    this.ethPrice$ = this.poolService.getEthPrice(BuyReefComponent.ETH_PRICE_INTERVAL).pipe(
      map(data => data.ethereum.usd),
    );

    this.selectedTokenBalances$ = combineLatest([
      this.selTokenSub,
      this.connectorService.providerUserInfo$.pipe(filter(v => !!v))
    ]).pipe(
      switchMap(([tokenSymbol, uInfo]: [TokenSymbol, IProviderUserInfo]) => this.apiService.getTokenBalance$(uInfo.address, tokenSymbol)),
      shareReplay(1)
    );

    // set token amount value to token balance
    this.selectedTokenBalances$.subscribe(( tokenBalances:Token[]) => {
      const bal = tokenBalances[0];
      this.tokenAmountSub.next(bal?bal.balance:0)
    });

    // we get all supported token prices in advance
    const tokenLivePrices$: Observable<IReefPricePerToken[]> = this.supportedTokensSub.pipe(
      filter(v => !!v.length),
      switchMap(supportedTkns => {
        const supportedTokenSymbols = supportedTkns.map(st => st.tokenSymbol);
        // price for each token symbol
        const supportedPrices$ = combineLatest(supportedTokenSymbols.map(ts => uniswapService.getReefPriceInInterval$(ts)));
        return supportedPrices$
      }),
      shareReplay(1)
    );

    this.selectedTokenPrice$ = combineLatest(
      [
        this.selTokenSub,
        this.tokenAmountSub,
        tokenLivePrices$
      ]
    ).pipe(
      map(value => {
        const tokenSymbol: TokenSymbol = value[0];
        const amount: number = value[1];
        const tokenPrices: IReefPricePerToken[] = value[2];
        const selectedPrice = tokenPrices.find(tp => tp.tokenSymbol === tokenSymbol);
        return UniswapService.tokenMinAmountCalc(selectedPrice, amount);
      }),
      shareReplay(1)
    );

  }

}
