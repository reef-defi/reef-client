import {Injectable} from '@angular/core';
import {ChainId, Fetcher, Percent, Route, Token, TokenAmount, Trade, TradeType} from '@uniswap/sdk';
import {addresses, reefPools} from '../../../assets/addresses';
import {ConnectorService} from './connector.service';
import {
  IContract,
  IReefPricePerToken,
  Token as Token_app,
  TokenSymbol,
  TokenSymbolDecimalPlaces
} from '../models/types';
import {NotificationService} from './notification.service';
import {addMinutes, getUnixTime} from 'date-fns';
import {combineLatest, Observable, Subject, timer} from 'rxjs';
import BigNumber from 'bignumber.js';
import {getKey} from '../utils/pools-utils';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {TransactionConfirmationComponent} from '../../shared/components/transaction-confirmation/transaction-confirmation.component';
import {first, map, shareReplay, startWith, switchMap, take} from 'rxjs/operators';
import {ApiService} from './api.service';
import {getDefaultProvider} from "@ethersproject/providers";

@Injectable({
  providedIn: 'root'
})
export class UniswapService {
  public static SUPPORTED_BUY_REEF_TOKENS = [
    {tokenSymbol: TokenSymbol.ETH, src: 'eth.png'},
    {tokenSymbol: TokenSymbol.USDT, src: 'usdt.png'}
  ];

  private static REFRESH_TOKEN_PRICE_RATE_MS = 60000 * 2; // 2 min

  readonly routerContract$ = this.connectorService.uniswapRouterContract$;
  readonly farmingContract$ = this.connectorService.farmingContract$;

  slippagePercent$: Observable<Percent>;
  readonly initPrices$: Observable<any>;
  private reefPricesLive = new Map<TokenSymbol, Observable<IReefPricePerToken>>();
  private slippageValue$ = new Subject<string>();
  private ethersProvider = getDefaultProvider(null, {
    alchemy: 'bvO1UNMq6u7FCLBcW4uM9blROTOPd4_E',
    infura: 'c80b6f5e0b554a59b295f7588eb958b7'
  });

  constructor(private readonly connectorService: ConnectorService,
              private readonly notificationService: NotificationService,
              private readonly router: Router,
              public dialog: MatDialog,
              private apiService: ApiService) {
    this.slippagePercent$ = this.slippageValue$.pipe(
      startWith(this.getSlippageIfSet()),
      map(sVal => this.getSlippagePercent(+sVal)),
      shareReplay(1)
    );
    this.initPrices$ = this.getInitPriceForSupportedBuyTokens$();
  }

  public static tokenMinAmountCalc(ppt_perOneToken: IReefPricePerToken, amount: number): IReefPricePerToken {
    const ppt = Object.assign({}, ppt_perOneToken);
    ppt.amountOutMin = !!ppt_perOneToken.amountOutMin ? ppt_perOneToken.amountOutMin * amount : 0;
    return ppt;
  }

  public async buyReef(tokenSymbol: TokenSymbol, amount: number, minutesDeadline: number): Promise<void> {
    if (addresses[tokenSymbol]) {
      let weiAmount;
      const web3 = await this.getWeb3();
      const checkSummed = web3.utils.toChecksumAddress(addresses[tokenSymbol]);
      const REEF = new Token(ChainId.MAINNET, web3.utils.toChecksumAddress(addresses.REEF_TOKEN), 18);
      const tokenB = await Fetcher.fetchTokenData(ChainId.MAINNET, checkSummed, this.ethersProvider);
      const pair = await Fetcher.fetchPairData(REEF, tokenB, this.ethersProvider);
      if (tokenSymbol === TokenSymbol.ETH || tokenSymbol === TokenSymbol.WETH) {
        weiAmount = this.connectorService.toWei(amount);
      } else {
        weiAmount = amount * +`1e${tokenB.decimals}`;
      }
      const route = new Route([pair], tokenB);
      const trade = new Trade(route, new TokenAmount(tokenB, weiAmount), TradeType.EXACT_INPUT);
      const slippageTolerance = await this.slippagePercent$.pipe(first()).toPromise();
      const amountOutMin = trade.minimumAmountOut(slippageTolerance).toFixed(0);
      const amountIn = trade.maximumAmountIn(slippageTolerance).toFixed(0);
      const path = [tokenB.address, REEF.address];
      const to = this.connectorService.providerUserInfo$.value.address;
      const deadline = getUnixTime(addMinutes(new Date(), minutesDeadline));
      const dialogRef = this.dialog.open(TransactionConfirmationComponent);
      try {
        const firstConfirm = true;
        if (tokenSymbol === TokenSymbol.ETH || tokenSymbol === TokenSymbol.WETH) {
          this.routerContract$.value.methods.swapExactETHForTokens(
              amountOutMin, path, to, deadline
          ).send({
            from: to,
            value: weiAmount,
            gasPrice: this.connectorService.getGasPrice()
          })
              .on('transactionHash', (hash) => {
                dialogRef.close();
                this.notificationService.showNotification('The transaction is now pending.', 'Ok', 'info');
                this.connectorService.addPendingTx(hash);
              })
            .on('receipt', async (receipt) => {
              this.connectorService.removePendingTx(receipt.transactionHash);
              this.notificationService.showNotification(`You've successfully bought ${amountOutMin} REEF!`, 'Okay', 'success');
              this.apiService.getTokenBalance$(to, TokenSymbol.REEF)
                .pipe(take(1))
                .subscribe((balances: Token_app[]) => {
                  this.apiService.updateTokenBalanceForAddress.next(balances[0])
                })
            })
            .on('error', (err) => {
              dialogRef.close();
              this.notificationService.showNotification('The tx did not go through', 'Close', 'error');
            });
        } else {
          const contract = this.connectorService.createLpContract(tokenSymbol);
          const hasAllowance = await this.approveToken(contract)
          if (hasAllowance) {
            amount = amount * +`1e${tokenB.decimals}`;
            this.routerContract$.value.methods.swapExactTokensForTokens(
              amount, amountOutMin, path, to, deadline
            ).send({
              from: to,
              gasPrice: this.connectorService.getGasPrice()
            })
              .on('transactionHash', (hash) => {
                dialogRef.close();
                this.notificationService.showNotification('The transaction is now pending.', 'Ok', 'info')
                this.connectorService.addPendingTx(hash);
              })
              .on('receipt', (receipt) => {
                this.connectorService.removePendingTx(receipt.transactionHash);
                this.notificationService.showNotification(`You've successfully bought ${amountOutMin} REEF!`, 'Okay', 'success');
                this.apiService.getTokenBalance$(to, TokenSymbol.REEF)
                  .pipe(take(1))
                  .subscribe((balances: Token_app[]) => {
                    this.apiService.updateTokenBalanceForAddress.next(balances[0])
                  });
              })
              .on('error', (err) => {
                dialogRef.close();
                this.notificationService.showNotification('The tx did not go through', 'Close', 'error');
              })
          }
        }
      } catch (e) {
        dialogRef.close();
        this.notificationService.showNotification('The tx did not go through', 'Close', 'error');
      }
    }
  }

  // TODO can we just use this.connectorService.createLpContract?
  public createLpContract(tokenSymbol: TokenSymbol | string): IContract {
    return this.connectorService.createLpContract(tokenSymbol);
  }

  public async approveToken(token: IContract): Promise<any> {
    return await this.connectorService
      .approveToken(token, this.routerContract$.value.options.address);
  }

  /*public async getReefPairWith(tokenSymbol: string, reefAmount: string, tokenBAmount: string): Promise<any> {
    const REEF = new Token(ChainId.MAINNET, addresses.REEF_TOKEN, 18);
    const tokenB = new Token(ChainId.MAINNET, addresses[tokenSymbol], 18);
    const pair = await Fetcher.fetchPairData(REEF, tokenB);
    const route = new Route([pair], WETH[REEF.chainId]);
    const route2 = new Route([pair], REEF);
    console.log(route.midPrice.toSignificant(6), 'ROUTE1');
    console.log(route2.midPrice.toSignificant(6), 'ROUTE2');
    const trade = new Trade(route, new TokenAmount(tokenB, tokenBAmount), TradeType.EXACT_INPUT);
    console.log(
      trade.executionPrice.toSignificant(6),
      trade.nextMidPrice.toSignificant(6),
      'TRADE'
    );

    const price = new Price(tokenB, REEF, '100000000', '12300000000000');
    console.log(price.toSignificant(3), 'price');
    return pair;
  }*/

  public getReefPriceInInterval$(tokenSymbol: TokenSymbol): Observable<IReefPricePerToken> {
    if (!this.reefPricesLive.has(TokenSymbol[tokenSymbol])) {
      if (addresses[tokenSymbol]) {
        const updatedTokenPrice = combineLatest([timer(0, UniswapService.REFRESH_TOKEN_PRICE_RATE_MS), this.slippagePercent$]).pipe(
          switchMap(([_, slippageP]: [any, Percent]) => this.getReefPricePer(tokenSymbol, 1, slippageP)),
          shareReplay(1)
        );
        this.reefPricesLive.set(tokenSymbol, updatedTokenPrice);
      }
    }
    return this.reefPricesLive.get(tokenSymbol);
  }

  /*public getLiveReefPricePer$(tokenSymbol: TokenSymbol, amount: number): Observable<IReefPricePerToken> {
    return this.getReefPriceInInterval$(tokenSymbol).pipe(
      map((ppt_perOneToken: IReefPricePerToken) => UniswapService.tokenMinAmountCalc(ppt_perOneToken, amount))
    );
  }*/

  public async addLiquidity(
    tokenA: string,
    tokenB: string,
    amountA: number,
    amountB: number,
    minutesDeadline: number,
  ): Promise<any> {
    const to = this.connectorService.providerUserInfo$.value.address;
    const deadline = getUnixTime(addMinutes(new Date(), minutesDeadline));
    const weiA = this.connectorService.toWei(amountA);
    const weiB = this.connectorService.toWei(amountB);
    try {
      const dialogRef = this.dialog.open(TransactionConfirmationComponent);
      this.routerContract$.value.methods.addLiquidity(
        tokenA, tokenB, weiA, weiB, weiA, weiB, to, deadline
      ).send({
        from: to,
        gasPrice: this.connectorService.getGasPrice()
      })
        .on('transactionHash', (hash) => {
          dialogRef.close();
          this.notificationService.showNotification('The transaction is now pending.', 'Ok', 'info')
          this.connectorService.addPendingTx(hash);
        })
        .on('receipt', (receipt) => {
          this.connectorService.removePendingTx(receipt.transactionHash);
          this.notificationService.showNotification(`You've successfully added liquidity to the pool`, 'Okay', 'success');
          this.apiService.refreshBalancesForAddress.next(to);
        })
        .on('error', (err) => {
          dialogRef.close();
          this.notificationService.showNotification('The tx did not go through', 'Close', 'error');
        })
    } catch (e) {
      this.notificationService.showNotification(e.message, 'Close', 'error');
    }
  }

  public async addLiquidityETH(
    token: string,
    amount: number,
    ethAmount: number,
    minutesDeadline: number
  ): Promise<any> {
    const to = this.connectorService.providerUserInfo$.value.address;
    const deadline = getUnixTime(addMinutes(new Date(), minutesDeadline));
    const tokenAmount = this.connectorService.toWei(amount);
    const weiEthAmount = this.connectorService.toWei(ethAmount);
    const slippagePer = await this.slippagePercent$.pipe(first()).toPromise();
    const tokenSlippage = this.getSlippageForAmount(tokenAmount, slippagePer);
    const ethSlippage = this.getSlippageForAmount(weiEthAmount, slippagePer);
    try {
      const dialogRef = this.dialog.open(TransactionConfirmationComponent);
      this.routerContract$.value.methods.addLiquidityETH(
        token, tokenAmount, tokenSlippage, ethSlippage, to, deadline
      ).send({
        from: to,
        value: `${weiEthAmount}`,
        gasPrice: this.connectorService.getGasPrice()
      })
        .on('transactionHash', (hash) => {
          dialogRef.close();
          this.notificationService.showNotification('The transaction is now pending.', 'Ok', 'info')
          this.connectorService.addPendingTx(hash);
        })
        .on('receipt', (receipt) => {
          this.connectorService.removePendingTx(receipt.transactionHash);
          this.notificationService.showNotification(`You've successfully added liquidity to the pool`, 'Okay', 'success');
          this.apiService.refreshBalancesForAddress.next(to);
        })
        .on('error', (err) => {
          dialogRef.close();
          this.notificationService.showNotification('The tx did not go through', 'Close', 'error');
        })
    } catch (e) {
      this.notificationService.showNotification(e.message, 'Close', 'error');
    }
  }

  public async deposit(tokenContract: IContract, poolAddress: string, tokenAmount: string): Promise<any> {
    const allowance = await this.connectorService
      .approveToken(tokenContract, this.farmingContract$.value.options.address);
    if (allowance) {
      const amount = new BigNumber(tokenAmount).toNumber();
      try {
        const dialogRef = this.dialog.open(TransactionConfirmationComponent);
        const poolSymbol = getKey(addresses, poolAddress);
        const fromAddress = this.connectorService.providerUserInfo$.value.address;
        this.farmingContract$.value.methods.deposit(reefPools[poolSymbol], amount).send({
          from: fromAddress,
        })
          .on('transactionHash', (hash) => {
            dialogRef.close();
            this.notificationService.showNotification('The transaction is now pending.', 'Ok', 'info')
            this.connectorService.addPendingTx(hash);
          })
          .on('receipt', (receipt) => {
            this.connectorService.removePendingTx(receipt.transactionHash);
            this.notificationService.showNotification(`You've successfully deposited ${tokenAmount}`, 'Okay', 'success');
            this.apiService.refreshBalancesForAddress.next(fromAddress);
          })
          .on('error', (err) => {
            dialogRef.close();
            this.notificationService.showNotification('The tx did not go through', 'Close', 'error');
          })
      } catch (e) {
        this.notificationService.showNotification(e.message, 'Close', 'error');
      }
    }
  }

  public async withdraw(poolAddress: string, tokenAmount: string | number): Promise<any> {
    try {
      const amount = new BigNumber(tokenAmount).toNumber();
      const poolSymbol = getKey(addresses, poolAddress);
      const dialogRef = this.dialog.open(TransactionConfirmationComponent);
      const fromAddress = this.connectorService.providerUserInfo$.value.address;
      this.farmingContract$.value.methods.withdraw(reefPools[poolSymbol], amount).send({
        from: fromAddress,
        gasPrice: this.connectorService.getGasPrice()
      })
        .on('transactionHash', (hash) => {
          dialogRef.close();
          this.notificationService.showNotification('The transaction is now pending.', 'Ok', 'info')
          this.connectorService.addPendingTx(hash);
        })
        .on('receipt', (receipt) => {
          this.connectorService.removePendingTx(receipt.transactionHash);
          this.notificationService.showNotification(`You've withdrawn ${tokenAmount}`, 'Okay', 'success');
          this.apiService.refreshBalancesForAddress.next(fromAddress);
        })
        .on('error', (err) => {
          dialogRef.close();
          this.notificationService.showNotification('The tx did not go through', 'Close', 'error');
        })
    } catch (e) {
      this.notificationService.showNotification(e.message, 'Close', 'error');
    }
  }

  public async getReefRewards(poolAddress: string): Promise<number> {
    const address = this.connectorService.providerUserInfo$.value.address;
    poolAddress = poolAddress.toLocaleLowerCase();
    console.log(poolAddress, 'hmmm...')
    const poolSymbol = getKey(addresses, poolAddress);
    console.log(poolSymbol, 'hello')
    const amount = await this.farmingContract$.value.methods.pendingRewards(reefPools[poolSymbol], address).call<number>();
    return this.connectorService.fromWei(amount);
  }

  public async getBalanceOf(tokenContract: IContract, ownerAddress: string): Promise<string> {
    const balance = await tokenContract.methods.balanceOf(ownerAddress).call<number>();
    return this.connectorService.fromWei(balance);
  }

  public async getStaked(poolAddress: string): Promise<any> {
    const address = this.connectorService.providerUserInfo$.value.address;
    poolAddress = poolAddress.toLocaleLowerCase();
    const poolSymbol = getKey(addresses, poolAddress);
    return await this.farmingContract$.value.methods.userInfo(reefPools[poolSymbol], address).call<number>();
  }

  public isSupportedERC20(address: string): boolean {
    return !!getKey(addresses, address);
  }

  public setSlippage(percent: string): void {
    this.slippageValue$.next(percent);
    localStorage.setItem('reef_slippage', `${percent}`);
  }

  private async getReefPricePer(tokenSymbol: TokenSymbol, amount?: number, slippageTolerance?: Percent): Promise<IReefPricePerToken> {
    if (addresses[tokenSymbol]) {
      const web3 = await this.getWeb3();
      const checkSummed = web3.utils.toChecksumAddress(addresses[tokenSymbol]);
      const REEF = new Token(ChainId.MAINNET, addresses.REEF_TOKEN, 18);
      // TODO to observable so previous request could be canceled
      const tokenB = await Fetcher.fetchTokenData(ChainId.MAINNET, checkSummed, this.ethersProvider);
      const pair = await Fetcher.fetchPairData(REEF, tokenB, this.ethersProvider);
      const route = new Route([pair], tokenB);
      const totalReef = await pair.reserveOf(REEF).toExact();
      if (amount > 0) {
        const exponent = TokenSymbolDecimalPlaces[tokenSymbol];
        const tokenAmt = (amount * Math.pow(10, exponent)).toString(10);
        const trade = new Trade(route, new TokenAmount(tokenB, tokenAmt), TradeType.EXACT_INPUT);
        if (!slippageTolerance) {
          slippageTolerance = await this.slippagePercent$.pipe(first()).toPromise();
        }
        const amountOutMin = trade.minimumAmountOut(slippageTolerance).toFixed(0);
        const price = {
          REEF_PER_TOKEN: route.midPrice.toSignificant(),
          TOKEN_PER_REEF: route.midPrice.invert().toSignificant(),
          totalReefReserve: totalReef,
          amountRequested: amount,
          amountOutMin: +amountOutMin,
          tokenSymbol
        };
        return price;
      }
      return {
        REEF_PER_TOKEN: route.midPrice.toSignificant(),
        TOKEN_PER_REEF: route.midPrice.invert().toSignificant(),
        totalReefReserve: totalReef,
        tokenSymbol
      };
    }
  }

  private async getWeb3() {
    return await this.connectorService.web3$.pipe(first()).toPromise();
  }

  private getSlippageForAmount(amount: string | number, slippagePercent: Percent) {
    return new BigNumber(amount).multipliedBy(+slippagePercent.toFixed() / 100).toString();
  }

  private goToReef(): void {
    this.router.navigate(['/reef']);
  }

  private getSlippageIfSet(): string {
    return localStorage.getItem('reef_slippage') || '0.5';
  }


  private getSlippagePercent(slippageValue: number) {
    return new Percent(`${(slippageValue * 10)}`, '1000');
  }

  private getInitPriceForSupportedBuyTokens$(): Observable<any> {
    const supportedTokenSymbols = UniswapService.SUPPORTED_BUY_REEF_TOKENS.map(st => st.tokenSymbol);
    // price for each token symbol
    const tokenPrices$ = combineLatest(
      supportedTokenSymbols.map(ts => this.getReefPriceInInterval$(ts))
    );
    return tokenPrices$.pipe(take(1), shareReplay(1));
  }


}
