import {Injectable} from '@angular/core';
import {ChainId, Fetcher, Percent, Route, Token, TokenAmount, Trade, TradeType,} from '@uniswap/sdk';
import {ConnectorService} from './connector.service';
import {IProviderUserInfo, IReefPricePerToken, ProviderName, TokenSymbol, TransactionType,} from '../models/types';
import {NotificationService} from './notification.service';
import {addMinutes, getUnixTime} from 'date-fns';
import {combineLatest, merge, Observable, Subject, timer} from 'rxjs';
import BigNumber from 'bignumber.js';
import {MaxUint256} from '../utils/pools-utils';
import {Router} from '@angular/router';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {TransactionConfirmationComponent} from '../../shared/components/transaction-confirmation/transaction-confirmation.component';
import {filter, first, map, shareReplay, startWith, switchMap, take,} from 'rxjs/operators';
import {ApiService} from './api.service';
import {BaseProvider, getDefaultProvider} from '@ethersproject/providers';
import {Contract} from 'web3-eth-contract';
import Web3 from 'web3';
import {AddressUtils} from '../../shared/utils/address.utils';
import {ProviderUtil} from '../../shared/utils/provider.util';
import {TokenUtil} from '../../shared/utils/token.util';
import {ErrorUtils} from '../../shared/utils/error.utils';
import {TransactionsService} from './transactions.service';
import {tap} from 'rxjs/internal/operators/tap';
import {TokenBalanceService} from '../../shared/service/token-balance.service';

@Injectable({
  providedIn: 'root',
})
export class UniswapService {
  private static REFRESH_TOKEN_PRICE_RATE_MS = 60000 * 2; // 2 min

  readonly routerContract$ = this.connectorService.uniswapRouterContract$;
  readonly farmingContract$ = this.connectorService.farmingContract$;

  slippagePercent$: Observable<Percent>;
  readonly initPrices$: Observable<any>;
  private reefPricesLive = new Map<TokenSymbol,
    { refreshSub: Subject<void>, price$: Observable<IReefPricePerToken> }>();
  private slippageValue$ = new Subject<string>();
  private ethersProvider$: Observable<BaseProvider>;

  constructor(
    private readonly connectorService: ConnectorService,
    private readonly notificationService: NotificationService,
    private readonly router: Router,
    public dialog: MatDialog,
    private apiService: ApiService,
    private readonly transactionService: TransactionsService
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
    // tslint:disable-next-line:variable-name
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
    payTokenSymbol: TokenSymbol,
    payAmount: number,
    amountOutMin: number,
    minutesDeadline: number
  ): Promise<void> {
    const info: IProviderUserInfo = await this.connectorService.providerUserInfo$
      .pipe(take(1))
      .toPromise();
    const addresses = info.availableSmartContractAddresses;
    const payTokenContractAddress = AddressUtils.getTokenSymbolContractAddress(
      addresses,
      payTokenSymbol
    );
    if (payTokenContractAddress) {
      let payWeiAmount;
      const web3 = await this.getWeb3();
      const payTokenAddressChecksummed = web3.utils.toChecksumAddress(
        payTokenContractAddress
      );
      const REEFToken = new Token(
        info.chainInfo.chain_id as ChainId,
        web3.utils.toChecksumAddress(addresses.REEF),
        18
      );
      const provider = await this.ethersProvider$.pipe(first()).toPromise();
      const payToken = await Fetcher.fetchTokenData(
        info.chainInfo.chain_id as ChainId,
        payTokenAddressChecksummed,
        provider
      );
      payWeiAmount = TokenUtil.toContractIntegerBalanceValue(
        payAmount,
        payTokenSymbol
      );
      const amountOutMinWei = TokenUtil.toContractIntegerBalanceValue(
        amountOutMin,
        TokenSymbol.REEF
      );
      console.log(amountOutMinWei, payWeiAmount, 'Hello');
      const path = [payToken.address, REEFToken.address];
      const to = info.address;
      const deadline = getUnixTime(addMinutes(new Date(), minutesDeadline));
      const dialogRef = this.dialog.open(TransactionConfirmationComponent);
      try {
        if (payTokenSymbol === TokenSymbol.ETH) {
          this.routerContract$.value.methods
            .swapExactETHForTokens(amountOutMinWei, path, to, deadline)
            .send({
              from: to,
              value: payWeiAmount,
              gasPrice: this.connectorService.getGasPrice(),
            })
            .on('transactionHash', (hash) => {
              dialogRef.close();
              this.notificationService.showNotification(
                'The transaction is now pending.',
                'Ok',
                'info'
              );
              this.transactionService.addPendingTx(
                hash,
                TransactionType.BUY_REEF,
                [payTokenSymbol, TokenSymbol.REEF],
                info.chainInfo.chain_id
              );
            })
            .on('receipt', async (receipt) => {
              this.transactionService.removePendingTx(receipt.transactionHash);
              this.notificationService.showNotification(
                this.boughtReefConfirmationMessage(amountOutMinWei.toString()),
                'Okay',
                'success'
              );
            })
            .on('error', (err) => {
              this.displayBuyReefTxError(dialogRef, err);
            });
        } else {
          const contract = this.connectorService.createErc20TokenContract(
            payTokenSymbol,
            addresses
          );
          const hasAllowance = await this.approveTokenToRouter(contract);
          if (hasAllowance) {
            this.routerContract$.value.methods
              .swapExactTokensForTokens(
                payWeiAmount,
                amountOutMinWei,
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
                this.transactionService.addPendingTx(
                  hash,
                  TransactionType.BUY_REEF,
                  [payTokenSymbol, TokenSymbol.REEF],
                  info.chainInfo.chain_id
                );
              })
              .on('receipt', (receipt) => {
                this.transactionService.removePendingTx(
                  receipt.transactionHash
                );
                this.notificationService.showNotification(
                  this.boughtReefConfirmationMessage(amountOutMinWei),
                  'Okay',
                  'success'
                );
              })
              .on('error', (err) => {
                this.displayBuyReefTxError(dialogRef, err);
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
      throw new Error('Can not find contract address for ' + payTokenSymbol);
    }
  }

  private displayBuyReefTxError(dialogRef: MatDialogRef<any>, err): void {
    dialogRef.close();
    let message = ErrorUtils.parseError(err.code);
    if (err.message.indexOf('INSUFFICIENT_OUTPUT_AMOUNT') > 0) {
      message = `Price went above slippage tolerance. You can adjust slippage in settings and try again.`;
    }
    this.notificationService.showNotification(message, 'Close', 'error');
  }

  private boughtReefConfirmationMessage(amountOutMin: string): string {
    const fixedVal = TokenUtil.toDisplayDecimalValue(
      amountOutMin,
      TokenSymbol.REEF
    );
    const fixedDecimal = TokenUtil.toMaxDisplayDecimalPlaces(
      fixedVal,
      TokenSymbol.REEF
    );
    return `Successfully bought minimum of ${fixedDecimal} REEF!`;
  }

  private async getAllowance(token: any, spenderAddr: string): Promise<any> {
    const info: IProviderUserInfo = await this.connectorService.providerUserInfo$
      .pipe(take(1))
      .toPromise();
    return token.methods.allowance(info.address, spenderAddr).call();
  }

  public getReefPriceInInterval$(
    tokenSymbol: TokenSymbol,
  ): { refreshSub: Subject<void>, price$: Observable<IReefPricePerToken> } {
    if (!this.reefPricesLive.has(tokenSymbol) && ) {
      const refreshSub = new Subject<void>();
      const refresh$ = merge([timer(0, UniswapService.REFRESH_TOKEN_PRICE_RATE_MS), refreshSub]);
      const price$ = combineLatest([
        refresh$,
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
      this.reefPricesLive.set(tokenSymbol, {price$, refreshSub});
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
    const slippagePer = await this.slippagePercent$.pipe(first()).toPromise();
    const weiMinA = this.getMinAmountFromSlippagePercent(weiA, slippagePer);
    const weiMinB = this.getMinAmountFromSlippagePercent(weiB, slippagePer);
    try {
      const dialogRef = this.dialog.open(TransactionConfirmationComponent);
      const contractA = this.connectorService.createErc20TokenContract(
        tokenSymbolA,
        info.availableSmartContractAddresses
      );
      const contractB = this.connectorService.createErc20TokenContract(
        tokenSymbolB,
        info.availableSmartContractAddresses
      );
      const hasAllowanceA = await this.approveTokenToRouter(contractA);
      const hasAllowanceB = await this.approveTokenToRouter(contractB);
      if (hasAllowanceA && hasAllowanceB) {
        this.routerContract$.value.methods
          .addLiquidity(
            tokenAddressA,
            tokenAddressB,
            weiA,
            weiB,
            weiMinA,
            weiMinB,
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
            const poolSymbol = AddressUtils.getReefPoolByPairSymbol(
              tokenSymbolB,
              info.availableSmartContractAddresses
            );
            this.transactionService.addPendingTx(
              hash,
              TransactionType.LIQUIDITY_USDT,
              [tokenSymbolA, tokenSymbolB, poolSymbol],
              info.chainInfo.chain_id
            );
          })
          .on('receipt', (receipt) => {
            this.transactionService.removePendingTx(receipt.transactionHash);
            this.notificationService.showNotification(
              `You've successfully added liquidity to the pool`,
              'Okay',
              'success'
            );
          })
          .on('error', (err) => {
            dialogRef.close();
            this.notificationService.showNotification(
              ErrorUtils.parseError(err.code),
              'Close',
              'error'
            );
          });
      }
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
    const amountTokenDesired = TokenUtil.toContractIntegerBalanceValue(
      amount,
      tokenSymbol
    );
    const weiEthAmount = this.connectorService.toWei(ethAmount);
    const slippagePer = await this.slippagePercent$.pipe(first()).toPromise();
    const amountTokenMin = this.getMinAmountFromSlippagePercent(
      amountTokenDesired,
      slippagePer
    );
    const amountETHMin = this.getMinAmountFromSlippagePercent(
      weiEthAmount,
      slippagePer
    );
    try {
      const dialogRef = this.dialog.open(TransactionConfirmationComponent);
      this.routerContract$.value.methods
        .addLiquidityETH(
          tokenAddress,
          amountTokenDesired,
          amountTokenMin,
          amountETHMin,
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
          const poolSymbol = AddressUtils.getReefPoolByPairSymbol(
            TokenSymbol.ETH,
            info.availableSmartContractAddresses
          );
          this.transactionService.addPendingTx(
            hash,
            TransactionType.LIQUIDITY_ETH,
            [TokenSymbol[tokenSymbol], TokenSymbol.ETH, poolSymbol],
            info.chainInfo.chain_id
          );
        })
        .on('receipt', (receipt) => {
          this.transactionService.removePendingTx(receipt.transactionHash);
          this.notificationService.showNotification(
            `You've successfully added liquidity to the pool`,
            'Okay',
            'success'
          );
        })
        .on('error', (err) => {
          dialogRef.close();
          this.notificationService.showNotification(
            ErrorUtils.parseError(err.code),
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
    const poolSymbol = AddressUtils.getAddressTokenSymbol(info, poolAddress);
    const transactionType = TokenUtil.getTransactionTypeByTokenName(poolSymbol);
    const allowance = await this.approveToken(
      tokenContract,
      this.farmingContract$.value.options.address.toString()
    );
    if (allowance) {
      const amount = TokenUtil.toContractIntegerBalanceValue(
        +tokenAmount,
        poolSymbol
      );
      try {
        const dialogRef = this.dialog.open(TransactionConfirmationComponent);
        const fromAddress = info.address;
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
            this.transactionService.addPendingTx(
              hash,
              transactionType,
              [poolSymbol],
              info.chainInfo.chain_id
            );
          })
          .on('receipt', (receipt) => {
            this.transactionService.removePendingTx(receipt.transactionHash);
            this.notificationService.showNotification(
              `You've successfully deposited ${tokenAmount}`,
              'Okay',
              'success'
            );
          })
          .on('error', (err) => {
            dialogRef.close();
            this.notificationService.showNotification(
              ErrorUtils.parseError(err.code),
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
      const poolSymbol = AddressUtils.getAddressTokenSymbol(info, poolAddress);
      const transactionType = TokenUtil.getTransactionTypeByTokenName(
        poolSymbol
      );
      const amount = TokenUtil.toContractIntegerBalanceValue(
        +tokenAmount,
        poolSymbol
      );
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
          this.transactionService.addPendingTx(
            hash,
            transactionType,
            [poolSymbol],
            info.chainInfo.chain_id
          );
        })
        .on('receipt', (receipt) => {
          this.transactionService.removePendingTx(receipt.transactionHash);
          this.notificationService.showNotification(
            `You've withdrawn ${tokenAmount}`,
            'Okay',
            'success'
          );
        })
        .on('error', (err) => {
          dialogRef.close();
          this.notificationService.showNotification(
            ErrorUtils.parseError(err.code),
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

  // TODO move to some other service
  async approveToken(
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
        gasPrice: this.connectorService.getGasPrice(info.chainInfo.chain_id),
      })
      .on('transactionHash', (hash) => {
        this.notificationService.showNotification(
          'The transaction is now pending.',
          'Ok',
          'info'
        );
        this.transactionService.addPendingTx(
          hash,
          TransactionType.APPROVE_TOKEN,
          [TokenSymbol.ETH],
          info.chainInfo.chain_id
        );
      })
      .on('receipt', (receipt) => {
        this.transactionService.removePendingTx(receipt.transactionHash);
        this.notificationService.showNotification(
          `Token approved`,
          'Okay',
          'success'
        );
      })
      .on('error', (err) => {
        this.notificationService.showNotification(
          ErrorUtils.parseError(err.code),
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
        // TODO  looks like shared method can exist to get trade object (buyReef has similar functionality)
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

  private getMinAmountFromSlippagePercent(
    amount: string | number,
    slippagePercent: Percent
  ): string {
    const relAmt = (100 - +slippagePercent.toFixed()) / 100;
    return new BigNumber(amount).multipliedBy(relAmt).toFixed();
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
    const supportedTokenSymbols = TokenBalanceService.SUPPORTED_BUY_REEF_TOKENS.map(
      (st) => st.tokenSymbol
    );
    // price for each token symbol
    const tokenPrices$ = combineLatest(
      supportedTokenSymbols.map((ts) => this.getReefPriceInInterval$(ts).price$)
    ).pipe(tap(v => console.log('INIT PRICES', v)));
    return tokenPrices$.pipe(take(1), shareReplay(1));
  }
}
