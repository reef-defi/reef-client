import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {catchError, filter, map, shareReplay, switchMap, take, tap} from 'rxjs/operators';
import {UniswapService} from '../../../../core/services/uniswap.service';
import {BehaviorSubject, combineLatest, EMPTY, Observable, of} from 'rxjs';
import {IProviderUserInfo, IReefPricePerToken, Token, TokenSymbol} from '../../../../core/models/types';
import {first} from 'rxjs/internal/operators/first';
import BigNumber from 'bignumber.js';
import {ConnectorService} from '../../../../core/services/connector.service';
import {ApiService} from '../../../../core/services/api.service';
import {roundDownTo} from '../../../../core/utils/math-utils';
import {Contract} from 'web3-eth-contract';
import {toTokenContractAddress} from "../../../../../assets/addresses";

@Component({
  selector: 'app-pool-page',
  templateUrl: './pool.page.html',
  styleUrls: ['./pool.page.scss']
})
export class PoolPage {
  readonly token$: Observable<TokenSymbol> = this.route.params.pipe(
    map((params) => TokenSymbol[params.token]),
    filter(v => !!v),
    shareReplay(1)
  );
  readonly providerUserInfo$ = this.connectorService.providerUserInfo$;
  readonly error$ = new BehaviorSubject<boolean>(false);
  public reefContract$: Observable<Contract | null>;
  public lpTokenContract$: Observable<Contract | null>;
  public pricePerTokens$: Observable<IReefPricePerToken | null> = of(null);
  public reefAmount = 0;
  public tokenAmount = 0;
  public loading = false;
  TokenSymbol = TokenSymbol;
  tokenBalanceReef$: Observable<Token>;
  tokenBalanceReefOposite$: Observable<Token>;
  private wasLastCalcForToken: boolean;

  constructor(private readonly route: ActivatedRoute,
              private readonly uniswapService: UniswapService,
              private readonly connectorService: ConnectorService,
              private apiService: ApiService) {
    this.tokenBalanceReefOposite$ = combineLatest([this.token$, this.providerUserInfo$]).pipe(
      switchMap(
        ([tokenSymbol, uInfo]: [TokenSymbol, IProviderUserInfo]) => this.apiService.getTokenBalance$(uInfo.address, TokenSymbol[tokenSymbol])),
      shareReplay(1)
    );
    this.tokenBalanceReef$ = this.providerUserInfo$.pipe(
      switchMap((uInfo: IProviderUserInfo) => this.apiService.getTokenBalance$(uInfo.address, TokenSymbol.REEF)),
      shareReplay(1)
    );

    this.lpTokenContract$ = combineLatest([this.token$, connectorService.providerUserInfo$]).pipe(
      map(([token, info]: [TokenSymbol, IProviderUserInfo]) => this.connectorService
        .createErc20TokenContract(token as TokenSymbol, info.availableSmartContractAddresses)),
      shareReplay(1)
    );
    this.reefContract$ = this.providerUserInfo$.pipe(
      map(info => this.connectorService.createErc20TokenContract(TokenSymbol.REEF, info.availableSmartContractAddresses)),
      shareReplay(1)
    );

    this.pricePerTokens$ = this.token$.pipe(
      switchMap(token => this.uniswapService.getReefPriceInInterval$(token)),
      tap((prices: IReefPricePerToken) => {
        if (this.wasLastCalcForToken === undefined) {
          this.tokenBalanceReef$.pipe(first()).subscribe(token => {
            this.calcTokenAmount(token.balance, prices.TOKEN_PER_REEF);
          });

        } else {
          this.wasLastCalcForToken ? this.calcTokenAmount(this.reefAmount, prices.TOKEN_PER_REEF)
            : this.calcReefAmount(this.tokenAmount, prices.REEF_PER_TOKEN);
        }
      }),
      catchError(() => {
        this.error$.next(true);
        return EMPTY;
      }),
    );
  }

  calcTokenAmount(val: number, tokenPerReef: string): void {
    this.wasLastCalcForToken = true;
    if (val && val > 0) {
      const x = new BigNumber(val);
      const y = new BigNumber(tokenPerReef);
      this.tokenAmount = roundDownTo(x.multipliedBy(y).toNumber(), 5);
      this.reefAmount = roundDownTo(x.toNumber(), 0);
    } else {
      this.tokenAmount = undefined;
      this.reefAmount = undefined;
    }
  }


  calcReefAmount(val: number, reefPerToken: string): void {

    this.wasLastCalcForToken = false;
    if (val && val > 0) {
      const x = new BigNumber(val);
      const y = new BigNumber(reefPerToken);
      this.reefAmount = roundDownTo(+x.multipliedBy(y).toNumber(), 0);
      this.tokenAmount = roundDownTo(+x.toNumber(), 5);
    } else {
      this.reefAmount = undefined;
      this.tokenAmount = undefined;
    }
  }

  async addLiquidity(tokenSymbolB: TokenSymbol): Promise<void> {
    this.loading = true;

    const info: IProviderUserInfo = await this.connectorService.providerUserInfo$.pipe(take(1)).toPromise();
    const addresses = info.availableSmartContractAddresses;
    try {
      const lpTokenContract = await this.lpTokenContract$.pipe(first()).toPromise();
      const reefContract = await this.reefContract$.pipe(first()).toPromise();
      const hasAllowance = await this.uniswapService.approveTokenToRouter(lpTokenContract);
      const hasAllowance2 = await this.uniswapService.approveTokenToRouter(reefContract);
      if (hasAllowance) {
        // TODO weth has a contract so addLiquidity could be better?
        if (tokenSymbolB === TokenSymbol.ETH) {
          await this.uniswapService.addLiquidityETH(
            addresses.REEF,
            this.reefAmount,
            this.tokenAmount,
            10
          );
        } else {
          await this.uniswapService.addLiquidity(
            addresses.REEF,
            toTokenContractAddress(info.availableSmartContractAddresses, tokenSymbolB),
            this.reefAmount,
            this.tokenAmount,
            10
          );
        }
        this.loading = false;
      }
      this.loading = false;
    } catch (e) {
      this.loading = false;
    }
  }

  /*private getPrice(): Observable<IReefPricePerToken> {
    return this.token$.pipe(
      first(val => !!val),
      tap((token: string) => this.initContracts(token)),
      switchMap(token => this.uniswapService.getLiveReefPrice$(TokenSymbol[token])),
      tap((prices: IReefPricePerToken) => {
        this.reefAmount = 1;
        this.tokenAmount = +prices.TOKEN_PER_REEF;
      }),
      catchError((e) => {
        console.log(e, 'wtf?')
        this.error$.next(true);
        return EMPTY;
      }),
    );
    /!*return this.token$.pipe(
      first(val => !!val),
      mergeMap((token) => {
        this.initContracts(token);
        return from(this.uniswapService.getReefPricePer(token));
      }),
      tap((prices: IReefPricePerToken) => {
        this.reefAmount = 1;
        this.tokenAmount = +prices.TOKEN_PER_REEF;
      }),
      catchError((e) => {
        console.log(e, 'error=', e);
        this.error$.next(true);
        return EMPTY;
      }),
    );*!/
  }*/

  preventDecimal($event: any): void {
    if ($event.key === '.' || $event.key === ',') {
      $event.preventDefault();
    }
  }
}
