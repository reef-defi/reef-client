import { Injectable } from '@angular/core';
import {
  ChainId,
  Fetcher,
  Percent,
  Route,
  Token,
  TokenAmount,
  Trade,
  TradeType,
} from '@uniswap/sdk';
import { ConnectorService } from './connector.service';
import {
  IProviderUserInfo,
  IReefPricePerToken,
  ProviderName,
  TokenSymbol,
} from '../models/types';
import { NotificationService } from './notification.service';
import { addMinutes, getUnixTime } from 'date-fns';
import { combineLatest, Observable, Subject, timer } from 'rxjs';
import BigNumber from 'bignumber.js';
import { MaxUint256 } from '../utils/pools-utils';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TransactionConfirmationComponent } from '../../shared/components/transaction-confirmation/transaction-confirmation.component';
import {
  filter,
  first,
  map,
  shareReplay,
  startWith,
  switchMap,
  take,
} from 'rxjs/operators';
import { ApiService } from './api.service';
import { BaseProvider, getDefaultProvider } from '@ethersproject/providers';
import { Contract } from 'web3-eth-contract';
import Web3 from 'web3';
import { AddressUtils } from '../../shared/utils/address.utils';
import { ProviderUtil } from '../../shared/utils/provider.util';
import { TokenUtil } from '../../shared/utils/token.util';

@Injectable({
  providedIn: 'root',
})
export class UniswapService {
  private static REFRESH_TOKEN_PRICE_RATE_MS = 60000 * 2; // 2 min

  readonly routerContract$ = this.connectorService.uniswapRouterContract$;
  readonly farmingContract$ = this.connectorService.farmingContract$;

  slippagePercent$: Observable<Percent>;
  readonly initPrices$: Observable<any>;
  private reefPricesLive = new Map<
    TokenSymbol,
    Observable<IReefPricePerToken>
  >();
  private slippageValue$ = new Subject<string>();
  private ethersProvider$: Observable<BaseProvider>;

  constructor(
    private readonly connectorService: ConnectorService,
    private readonly notificationService: NotificationService,
    private readonly router: Router,
    public dialog: MatDialog,
    private apiService: ApiService
  ) {
    this.ethersProvider$ = connectorService.providerUserInfo$.pipe(
      map((info) =>
        getDefaultProvider(info.chainInfo.network, {
          alchemy: ProviderUtil.getProviderApiKey(ProviderName.ALCHEMY),
          infura: ProviderUtil.getProviderApiKey(ProviderName.INFURA),
        })
      ),
      shareReplay(1)
    );
    this.slippagePercent$ = this.slippageValue$.pipe(
      startWith(this.getSlippageIfSet()),
      map((sVal) => this.getSlippagePercent(+sVal)),
      shareReplay(1)
    );
    this.initPrices$ = this.getInitPriceForSupportedBuyTokens$();
  }

  public static tokenMinAmountCalc(
    ppt_perOneToken: IReefPricePerToken,
    amount: number
  ): IReefPricePerToken {
    const ppt = Object.assign({}, ppt_perOneToken);
    ppt.amountOutMin = !!ppt_perOneToken.amountOutMin
      ? ppt_perOneToken.amountOutMin * amount
      : 0;
    return ppt;
  }

  public async buyReef(
    tokenSymbol: TokenSymbol,
    amount: number,
    minutesDeadline: number
  ): Promise<void> {
    const info: IProviderUserInfo = await this.connectorService.providerUserInfo$
      .pipe(take(1))
      .toPromise();
    const addresses = info.availableSmartContractAddresses;
    const tokenContractAddress = AddressUtils.getTokenSymbolContractAddress(
      addresses,
      tokenSymbol
    );
    if (tokenContractAddress) {
      let weiAmount;
      const web3 = await this.getWeb3();
      const checkSummed = web3.utils.toChecksumAddress(tokenContractAddress);
      const REEF = new Token(
        info.chainInfo.chain_id as ChainId,
        web3.utils.toChecksumAddress(addresses.REEF),
        18
      );
      const provider = await this.ethersProvider$.pipe(first()).toPromise();
      const tokenB = await Fetcher.fetchTokenData(
        info.chainInfo.chain_id as ChainId,
        checkSummed,
        provider
      );
      const pair = await Fetcher.fetchPairData(REEF, tokenB, provider);
      /* replaced
          if (tokenSymbol === TokenSymbol.ETH || tokenSymbol === TokenSymbol.WETH) {
              weiAmount = this.connectorService.toWei(amount);
          } else {
              weiAmount = amount * +`1e${tokenB.decimals}`;*/
      weiAmount = TokenUtil.toContractIntegerBalanceValue(amount, tokenSymbol);
      // }
      const route = new Route([pair], tokenB);
      const trade = new Trade(
        route,
        new TokenAmount(tokenB, weiAmount),
        TradeType.EXACT_INPUT
      );
      const slippageTolerance = await this.slippagePercent$
        .pipe(first())
        .toPromise();
      const amountOutMin = trade.minimumAmountOut(slippageTolerance).toFixed(0);
      const amountIn = trade.maximumAmountIn(slippageTolerance).toFixed(0);
      const path = [tokenB.address, REEF.address];
      const to = info.address;
      const deadline = getUnixTime(addMinutes(new Date(), minutesDeadline));
      const dialogRef = this.dialog.open(TransactionConfirmationComponent);
      try {
        const firstConfirm = true;
        if (tokenSymbol === TokenSymbol.ETH) {
          this.routerContract$.value.methods
            .swapExactETHForTokens(amountOutMin, path, to, deadline)
            .send({
              from: to,
              value: weiAmount,
              gasPrice: this.connectorService.getGasPrice(),
            })
            .on('transactionHash', (hash) => {
              dialogRef.close();
              this.notificationService.showNotification(
                'The transaction is now pending.',
                'Ok',
                'info'
              );
              this.connectorService.addPendingTx(hash);
            })
            .on('receipt', async (receipt) => {
              this.connectorService.removePendingTx(receipt.transactionHash);
              this.notificationService.showNotification(
                `You've successfully bought ${amountOutMin} REEF!`,
                'Okay',
                'success'
              );
              this.apiService.updateTokensInBalances.next([
                tokenSymbol,
                TokenSymbol.REEF,
              ]);
            })
            .on('error', (err) => {
              dialogRef.close();
              this.notificationService.showNotification(
                'The tx did not go through',
                'Close',
                'error'
              );
            });
        } else {
          const contract = this.connectorService.createErc20TokenContract(
            tokenSymbol,
            addresses
          );
          const hasAllowance = await this.approveTokenToRouter(contract);
          if (hasAllowance) {
            amount = amount * +`1e${tokenB.decimals}`;
            this.routerContract$.value.methods
              .swapExactTokensForTokens(
                amount,
                amountOutMin,
                path,
                to,
                deadline
              )
              .send({
                from: to,
                gasPrice: this.connectorService.getGasPrice(),
              })
              .on('transactionHash', (hash) => {
                dialogRef.close();
                this.notificationService.showNotification(
                  'The transaction is now pending.',
                  'Ok',
                  'info'
                );
                this.connectorService.addPendingTx(hash);
              })
              .on('receipt', (receipt) => {
                this.connectorService.removePendingTx(receipt.transactionHash);
                this.notificationService.showNotification(
                  `You've successfully bought ${amountOutMin} REEF!`,
                  'Okay',
                  'success'
                );
                this.apiService.updateTokensInBalances.next([
                  tokenSymbol,
                  TokenSymbol.REEF,
                ]);
              })
              .on('error', (err) => {
                dialogRef.close();
                this.notificationService.showNotification(
                  'The tx did not go through',
                  'Close',
                  'error'
                );
              });
          }
        }
      } catch (e) {
        dialogRef.close();
        this.notificationService.showNotification(
          'The tx did not go through',
          'Close',
          'error'
        );
      }
    } else {
      throw new Error('Can not find contract address for ' + tokenSymbol);
    }
  }

  private async getAllowance(token: any, spenderAddr: string): Promise<any> {
    const info: IProviderUserInfo = await this.connectorService.providerUserInfo$
      .pipe(take(1))
      .toPromise();
    return token.methods.allowance(info.address, spenderAddr).call();
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

  public getReefPriceInInterval$(
    tokenSymbol: TokenSymbol
  ): Observable<IReefPricePerToken> {
    if (!this.reefPricesLive.has(TokenSymbol[tokenSymbol])) {
      const updatedTokenPrice = combineLatest([
        timer(0, UniswapService.REFRESH_TOKEN_PRICE_RATE_MS),
        this.slippagePercent$,
      ]).pipe(
        switchMap(([_, slippageP]: [any, Percent]) =>
          this.connectorService.providerUserInfo$.pipe(
            filter(
              (info) =>
                !!AddressUtils.getTokenSymbolContractAddress(
                  info.availableSmartContractAddresses,
                  tokenSymbol
                )
            ),
            switchMap(() => this.getReefPricePer(tokenSymbol, 1, slippageP))
          )
        ),
        shareReplay(1)
      );
      this.reefPricesLive.set(tokenSymbol, updatedTokenPrice);
    }
    return this.reefPricesLive.get(tokenSymbol);
  }

  /*public getLiveReefPricePer$(tokenSymbol: TokenSymbol, amount: number): Observable<IReefPricePerToken> {
      return this.getReefPriceInInterval$(tokenSymbol).pipe(
        map((ppt_perOneToken: IReefPricePerToken) => UniswapService.tokenMinAmountCalc(ppt_perOneToken, amount))
      );
    }*/

  public async addLiquidity(
    tokenAddressA: string,
    tokenAddressB: string,
    amountA: number,
    amountB: number,
    minutesDeadline: number
  ): Promise<any> {
    const info: IProviderUserInfo = await this.connectorService.providerUserInfo$
      .pipe(take(1))
      .toPromise();
    const tokenSymbolA = AddressUtils.getAddressTokenSymbol(
      info,
      tokenAddressA
    );
    const tokenSymbolB = AddressUtils.getAddressTokenSymbol(
      info,
      tokenAddressB
    );
    const to = info.address;
    const deadline = getUnixTime(addMinutes(new Date(), minutesDeadline));
    const weiA = TokenUtil.toContractIntegerBalanceValue(amountA, tokenSymbolA);
    const weiB = TokenUtil.toContractIntegerBalanceValue(amountB, tokenSymbolB);
    /*replaced
      const weiA = this.connectorService.toWei(amountA);
      const weiB = this.connectorService.toWei(amountB);*/
    try {
      const dialogRef = this.dialog.open(TransactionConfirmationComponent);
      this.routerContract$.value.methods
        .addLiquidity(
          tokenAddressA,
          tokenAddressB,
          weiA,
          weiB,
          weiA,
          weiB,
          to,
          deadline
        )
        .send({
          from: to,
          gasPrice: this.connectorService.getGasPrice(),
        })
        .on('transactionHash', (hash) => {
          dialogRef.close();
          this.notificationService.showNotification(
            'The transaction is now pending.',
            'Ok',
            'info'
          );
          this.connectorService.addPendingTx(hash);
        })
        .on('receipt', (receipt) => {
          this.connectorService.removePendingTx(receipt.transactionHash);
          this.notificationService.showNotification(
            `You've successfully added liquidity to the pool`,
            'Okay',
            'success'
          );
          const poolSymbol = AddressUtils.getReefPoolByPairSymbol(
            tokenSymbolB,
            info.availableSmartContractAddresses
          );
          this.apiService.updateTokensInBalances.next([
            tokenSymbolA,
            tokenSymbolB,
            poolSymbol,
          ]);
        })
        .on('error', (err) => {
          dialogRef.close();
          this.notificationService.showNotification(
            'The tx did not go through',
            'Close',
            'error'
          );
        });
    } catch (e) {
      this.notificationService.showNotification(e.message, 'Close', 'error');
    }
  }

  public async addLiquidityETH(
    tokenAddress: string,
    amount: number,
    ethAmount: number,
    minutesDeadline: number
  ): Promise<any> {
    const info: IProviderUserInfo = await this.connectorService.providerUserInfo$
      .pipe(take(1))
      .toPromise();
    const tokenSymbol = AddressUtils.getAddressTokenSymbol(info, tokenAddress);
    const to = info.address;
    const deadline = getUnixTime(addMinutes(new Date(), minutesDeadline));
    // replaced const tokenAmount = this.connectorService.toWei(amount);
    const tokenAmount = TokenUtil.toContractIntegerBalanceValue(
      amount,
      tokenSymbol
    );
    const weiEthAmount = this.connectorService.toWei(ethAmount);
    const slippagePer = await this.slippagePercent$.pipe(first()).toPromise();
    const tokenSlippage = this.getSlippageForAmount(tokenAmount, slippagePer);
    const ethSlippage = this.getSlippageForAmount(weiEthAmount, slippagePer);
    try {
      const dialogRef = this.dialog.open(TransactionConfirmationComponent);
      this.routerContract$.value.methods
        .addLiquidityETH(
          tokenAddress,
          tokenAmount,
          tokenSlippage,
          ethSlippage,
          to,
          deadline
        )
        .send({
          from: to,
          value: `${weiEthAmount}`,
          gasPrice: this.connectorService.getGasPrice(),
        })
        .on('transactionHash', (hash) => {
          dialogRef.close();
          this.notificationService.showNotification(
            'The transaction is now pending.',
            'Ok',
            'info'
          );
          this.connectorService.addPendingTx(hash);
        })
        .on('receipt', (receipt) => {
          this.connectorService.removePendingTx(receipt.transactionHash);
          this.notificationService.showNotification(
            `You've successfully added liquidity to the pool`,
            'Okay',
            'success'
          );
          const poolSymbol = AddressUtils.getReefPoolByPairSymbol(
            TokenSymbol.ETH,
            info.availableSmartContractAddresses
          );
          this.apiService.updateTokensInBalances.next([
            TokenSymbol[tokenSymbol],
            TokenSymbol.ETH,
            poolSymbol,
          ]);
        })
        .on('error', (err) => {
          dialogRef.close();
          this.notificationService.showNotification(
            'The tx did not go through',
            'Close',
            'error'
          );
        });
    } catch (e) {
      this.notificationService.showNotification(e.message, 'Close', 'error');
    }
  }

  public async deposit(
    tokenContract: Contract,
    poolAddress: string,
    tokenAmount: string
  ): Promise<any> {
    const info: IProviderUserInfo = await this.connectorService.providerUserInfo$
      .pipe(take(1))
      .toPromise();
    const addresses = info.availableSmartContractAddresses;
    const allowance = await this.approveToken(
      tokenContract,
      this.farmingContract$.value.options.address
    );
    if (allowance) {
      const amount = new BigNumber(tokenAmount).toNumber();
      try {
        const dialogRef = this.dialog.open(TransactionConfirmationComponent);
        const fromAddress = info.address;
        const poolSymbol = AddressUtils.getAddressTokenSymbol(
          info,
          poolAddress
        );
        const reefPoolId = AddressUtils.getTokenSymbolReefPoolId(poolSymbol);
        this.farmingContract$.value.methods
          .deposit(reefPoolId, amount)
          .send({
            from: fromAddress,
          })
          .on('transactionHash', (hash) => {
            dialogRef.close();
            this.notificationService.showNotification(
              'The transaction is now pending.',
              'Ok',
              'info'
            );
            this.connectorService.addPendingTx(hash);
          })
          .on('receipt', (receipt) => {
            this.connectorService.removePendingTx(receipt.transactionHash);
            this.notificationService.showNotification(
              `You've successfully deposited ${tokenAmount}`,
              'Okay',
              'success'
            );
            // TODO refresh only tokens that changed balance
            this.apiService.refreshBalancesForAddress.next(fromAddress);
          })
          .on('error', (err) => {
            dialogRef.close();
            this.notificationService.showNotification(
              'The tx did not go through',
              'Close',
              'error'
            );
          });
      } catch (e) {
        this.notificationService.showNotification(e.message, 'Close', 'error');
      }
    }
  }

  public async withdraw(
    poolAddress: string,
    tokenAmount: string | number
  ): Promise<any> {
    try {
      const info: IProviderUserInfo = await this.connectorService.providerUserInfo$
        .pipe(take(1))
        .toPromise();
      const addresses = info.availableSmartContractAddresses;
      const amount = new BigNumber(tokenAmount).toNumber();
      const poolSymbol = AddressUtils.getAddressTokenSymbol(info, poolAddress);
      const reefPoolId = AddressUtils.getTokenSymbolReefPoolId(poolSymbol);
      const dialogRef = this.dialog.open(TransactionConfirmationComponent);
      const fromAddress = info.address;
      this.farmingContract$.value.methods
        .withdraw(reefPoolId, amount)
        .send({
          from: fromAddress,
          gasPrice: this.connectorService.getGasPrice(),
        })
        .on('transactionHash', (hash) => {
          dialogRef.close();
          this.notificationService.showNotification(
            'The transaction is now pending.',
            'Ok',
            'info'
          );
          this.connectorService.addPendingTx(hash);
        })
        .on('receipt', (receipt) => {
          this.connectorService.removePendingTx(receipt.transactionHash);
          this.notificationService.showNotification(
            `You've withdrawn ${tokenAmount}`,
            'Okay',
            'success'
          );
          // TODO refresh only tokens that changed balance
          this.apiService.refreshBalancesForAddress.next(fromAddress);
        })
        .on('error', (err) => {
          dialogRef.close();
          this.notificationService.showNotification(
            'The tx did not go through',
            'Close',
            'error'
          );
        });
    } catch (e) {
      this.notificationService.showNotification(e.message, 'Close', 'error');
    }
  }

  public async getReefRewards(poolAddress: string): Promise<number> {
    const info: IProviderUserInfo = await this.connectorService.providerUserInfo$
      .pipe(take(1))
      .toPromise();
    const addresses = info.availableSmartContractAddresses;
    const address = info.address;
    poolAddress = poolAddress.toLocaleLowerCase();
    const poolSymbol = AddressUtils.getAddressTokenSymbol(info, poolAddress);
    const reefPoolId = AddressUtils.getTokenSymbolReefPoolId(poolSymbol);
    // @ts-ignore
    const amount = await this.farmingContract$.value.methods
      .pendingRewards(reefPoolId, address)
      .call<number>();
    return this.connectorService.fromWei(amount);
  }

  public async getStaked(poolAddress: string): Promise<any> {
    const info: IProviderUserInfo = await this.connectorService.providerUserInfo$
      .pipe(take(1))
      .toPromise();
    const addresses = info.availableSmartContractAddresses;

    const address = info.address;
    poolAddress = poolAddress.toLocaleLowerCase();
    const poolSymbol = AddressUtils.getAddressTokenSymbol(info, poolAddress);
    const reefPoolId = AddressUtils.getTokenSymbolReefPoolId(poolSymbol);
    // @ts-ignore
    return await this.farmingContract$.value.methods
      .userInfo(reefPoolId, address)
      .call<number>();
  }

  public setSlippage(percent: string): void {
    this.slippageValue$.next(percent);
    localStorage.setItem('reef_slippage', `${percent}`);
  }

  public async approveTokenToRouter(token: Contract): Promise<any> {
    return await this.approveToken(
      token,
      this.routerContract$.value.options.address
    );
  }

  private async approveToken(
    tokenContract: Contract | any,
    spenderAddr: string
  ): Promise<any> {
    const allowance = await this.getAllowance(tokenContract, spenderAddr);
    if (allowance && +allowance > 0) {
      return true;
    }
    const info: IProviderUserInfo = await this.connectorService.providerUserInfo$
      .pipe(take(1))
      .toPromise();
    return await tokenContract.methods
      .approve(spenderAddr, MaxUint256.toString())
      .send({
        from: info.address, // hardcode
        gasPrice: this.connectorService.getGasPrice(),
      })
      .on('transactionHash', (hash) => {
        this.notificationService.showNotification(
          'The transaction is now pending.',
          'Ok',
          'info'
        );
        this.connectorService.addPendingTx(hash);
      })
      .on('receipt', (receipt) => {
        this.connectorService.removePendingTx(receipt.transactionHash);
        this.notificationService.showNotification(
          `Token approved`,
          'Okay',
          'success'
        );
        this.apiService.updateTokensInBalances.next([TokenSymbol.ETH]);
      })
      .on('error', (err) => {
        this.notificationService.showNotification(
          'The tx did not go through',
          'Close',
          'error'
        );
      });
  }

  private async getReefPricePer(
    tokenSymbol: TokenSymbol,
    amount?: number,
    slippageTolerance?: Percent
  ): Promise<IReefPricePerToken> {
    const info: IProviderUserInfo = await this.connectorService.providerUserInfo$
      .pipe(take(1))
      .toPromise();
    const addresses = info.availableSmartContractAddresses;
    const tokenContractAddress = AddressUtils.getTokenSymbolContractAddress(
      info.availableSmartContractAddresses,
      tokenSymbol
    );
    if (tokenContractAddress) {
      const web3 = await this.getWeb3();
      const checkSummed = web3.utils.toChecksumAddress(tokenContractAddress);
      const REEF = new Token(
        info.chainInfo.chain_id as ChainId,
        web3.utils.toChecksumAddress(addresses.REEF),
        18
      );
      // TODO to observable so previous request could be canceled
      const provider = await this.ethersProvider$.pipe(first()).toPromise();
      const tokenB = await Fetcher.fetchTokenData(
        info.chainInfo.chain_id as ChainId,
        checkSummed,
        provider
      );
      const pair = await Fetcher.fetchPairData(REEF, tokenB, provider);
      const route = new Route([pair], tokenB);
      const totalReef = await pair.reserveOf(REEF).toExact();
      if (amount > 0) {
        const tokenAmt = TokenUtil.toContractIntegerBalanceValue(
          amount,
          tokenSymbol
        );
        const trade = new Trade(
          route,
          new TokenAmount(tokenB, tokenAmt),
          TradeType.EXACT_INPUT
        );
        if (!slippageTolerance) {
          slippageTolerance = await this.slippagePercent$
            .pipe(first())
            .toPromise();
        }
        const amountOutMin = trade
          .minimumAmountOut(slippageTolerance)
          .toFixed(0);
        const price = {
          REEF_PER_TOKEN: route.midPrice.toSignificant(),
          TOKEN_PER_REEF: route.midPrice.invert().toSignificant(),
          totalReefReserve: totalReef,
          amountRequested: amount,
          amountOutMin: +amountOutMin,
          tokenSymbol,
        };
        return price;
      }
      return {
        REEF_PER_TOKEN: route.midPrice.toSignificant(),
        TOKEN_PER_REEF: route.midPrice.invert().toSignificant(),
        totalReefReserve: totalReef,
        tokenSymbol,
      };
    }
    return Promise.resolve(null);
  }

  private async getWeb3(): Promise<Web3> {
    return await this.connectorService.web3$.pipe(first()).toPromise();
  }

  private getSlippageForAmount(
    amount: string | number,
    slippagePercent: Percent
  ): string {
    return new BigNumber(amount)
      .multipliedBy(+slippagePercent.toFixed() / 100)
      .toString();
  }

  private goToReef(): void {
    this.router.navigate(['/reef']);
  }

  private getSlippageIfSet(): string {
    return localStorage.getItem('reef_slippage') || '0.5';
  }

  private getSlippagePercent(slippageValue: number): Percent {
    return new Percent(`${slippageValue * 10}`, '1000');
  }

  private getInitPriceForSupportedBuyTokens$(): Observable<any> {
    const supportedTokenSymbols = ApiService.SUPPORTED_BUY_REEF_TOKENS.map(
      (st) => st.tokenSymbol
    );
    // price for each token symbol
    const tokenPrices$ = combineLatest(
      supportedTokenSymbols.map((ts) => this.getReefPriceInInterval$(ts))
    );
    return tokenPrices$.pipe(take(1), shareReplay(1));
  }
}
