import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {catchError, map, mergeMap, switchMap, tap} from 'rxjs/operators';
import {catchError, map, switchMap, tap} from 'rxjs/operators';
import {UniswapService} from '../../../../core/services/uniswap.service';
import {BehaviorSubject, combineLatest, EMPTY, from, Observable, of} from 'rxjs';
import {
  IContract,
  IProviderUserInfo,
  IReefPricePerToken,
  TokenBalance,
  TokenSymbol
} from '../../../../core/models/types';
import {BehaviorSubject, EMPTY, Observable, of} from 'rxjs';
import {IContract, IReefPricePerToken, TokenSymbol} from '../../../../core/models/types';
import {first} from 'rxjs/internal/operators/first';
import BigNumber from 'bignumber.js';
import {addresses} from '../../../../../assets/addresses';
import {ConnectorService} from '../../../../core/services/connector.service';
import {ApiService} from '../../../../core/services/api.service';

@Component({
  selector: 'app-pool-page',
  templateUrl: './pool.page.html',
  styleUrls: ['./pool.page.scss']
})
export class PoolPage implements OnInit {
  readonly token$ = this.route.params.pipe(
    map((params) => params.token),
  );
  readonly providerUserInfo$ = this.connectorService.providerUserInfo$;
  readonly reefContract$ = new BehaviorSubject<IContract | null>(null);
  readonly error$ = new BehaviorSubject<boolean>(false);
  public lpTokenContract$ = new BehaviorSubject<IContract | null>(null);
  public pricePerTokens$: Observable<IReefPricePerToken | null> = of(null);
  public reefAmount = 0;
  public tokenAmount = 0;
  public loading = false;
  TokenSymbol = TokenSymbol;
  tokenBalanceReef$: Observable<TokenBalance>;
  tokenBalanceReefOposite$: Observable<TokenBalance>;

  constructor(private readonly route: ActivatedRoute,
              private readonly uniswapService: UniswapService,
              private readonly connectorService: ConnectorService,
              private apiService: ApiService) {
    this.tokenBalanceReefOposite$ = combineLatest([this.token$, this.providerUserInfo$]).pipe(
      switchMap(([tokenSymbol, uInfo]: [string, IProviderUserInfo]) => this.apiService.getTokenBalance$(uInfo.address, TokenSymbol[tokenSymbol], true)),
      map(b=>b[0])
    );
    this.tokenBalanceReef$ = this.providerUserInfo$.pipe(
      switchMap((uInfo: IProviderUserInfo) => this.apiService.getTokenBalance$(uInfo.address, TokenSymbol.REEF, true)),
      map(b=>b[0])
    );
  }

  ngOnInit(): void {
    this.pricePerTokens$ = this.getPrice();
  }

  calcTokenAmount(val: number, tokenPerReef: string): void {
    if (val && val > 0) {
      const x = new BigNumber(val);
      const y = new BigNumber(tokenPerReef);
      this.tokenAmount = x.multipliedBy(y).toNumber();
      this.reefAmount = x.toNumber();
    } else {
      this.tokenAmount = undefined;
      this.reefAmount = undefined;
    }
  }


  calcReefAmount(val: number, reefPerToken: string): void {
    if (val && val > 0) {
      const x = new BigNumber(val);
      const y = new BigNumber(reefPerToken);
      this.reefAmount = +x.multipliedBy(y).toNumber();
      this.tokenAmount = +x.toNumber();
    } else {
      this.reefAmount = undefined;
      this.tokenAmount = undefined;
    }
  }

  async addLiquidity(tokenB: string): Promise<void> {
    this.loading = true;
    try {
      const hasAllowance = await this.uniswapService.approveToken(this.lpTokenContract$.value);
      const hasAllowance2 = await this.uniswapService.approveToken(this.reefContract$.value);
      if (hasAllowance) {
        if (tokenB === 'WETH' || tokenB === 'ETH') {
          await this.uniswapService.addLiquidityETH(
            addresses.REEF_TOKEN,
            this.reefAmount,
            this.tokenAmount,
            10
          );
        } else {
          await this.uniswapService.addLiquidity(
            addresses.REEF_TOKEN,
            addresses[tokenB],
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

  private getPrice(): Observable<IReefPricePerToken> {
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
    /*return this.token$.pipe(
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
    );*/
  }

  private async initContracts(token: string): Promise<void> {
    const contract = this.uniswapService.createLpContract(token);
    this.lpTokenContract$.next(contract);
    this.reefContract$.next(this.uniswapService.createLpContract('REEF_TOKEN'));
  }
}
