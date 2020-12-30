import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {catchError, finalize, map, mergeMap, tap} from 'rxjs/operators';
import {UniswapService} from '../../../../core/services/uniswap.service';
import {BehaviorSubject, EMPTY, from, Observable, of} from 'rxjs';
import {IContract, IReefPricePerToken} from '../../../../core/models/types';
import {first} from 'rxjs/internal/operators/first';
import BigNumber from 'bignumber.js';
import {addresses} from '../../../../../assets/addresses';
import {ConnectorService} from '../../../../core/services/connector.service';

const REEF_TOKEN = '0x894a180Cf0bdf32FF6b3268a1AE95d2fbC5500ab'; // TODO change this when mainnet REEF pools available

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
  public userTokenBalance = '';
  public reefAmount = 0;
  public tokenAmount = 0;
  public loading = false;

  constructor(private readonly route: ActivatedRoute,
              private readonly uniswapService: UniswapService,
              private readonly connectorService: ConnectorService) {
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
      this.reefAmount = x.multipliedBy(y).toNumber();
      this.tokenAmount = x.toNumber();
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
            REEF_TOKEN,
            this.reefAmount,
            this.tokenAmount,
            10
          );
        } else {
          await this.uniswapService.addLiquidity(
            REEF_TOKEN,
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
      mergeMap((token) => {
        this.initContracts(token);
        return from(this.uniswapService.getReefPricePer(token));
      }),
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
  }

  private async initContracts(token: string): Promise<void> {
    const contract = this.uniswapService.createLpContract(token);
    this.lpTokenContract$.next(contract);
    this.reefContract$.next(this.uniswapService.createLpContract('TESTR'));
    if (this.providerUserInfo$.value) {
      this.userTokenBalance = await this.uniswapService.getBalanceOf(contract, this.providerUserInfo$.value.address);
    } else {
      this.providerUserInfo$.pipe(
        first(val => !!val)
      ).subscribe(async val => {
        this.userTokenBalance = await this.uniswapService.getBalanceOf(contract, val.address);
      });
    }
  }
}
