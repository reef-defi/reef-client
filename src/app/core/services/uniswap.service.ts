import {Injectable} from '@angular/core';
import {ChainId, Fetcher, Pair, Percent, Price, Route, Token, TokenAmount, Trade, TradeType, WETH} from '@uniswap/sdk';
import {addresses, reefPools} from '../../../assets/addresses';
import {ConnectorService} from './connector.service';
import {IContract, IReefPricePerToken} from '../models/types';
import {NotificationService} from './notification.service';
import {addMinutes, getUnixTime} from 'date-fns';
import {BehaviorSubject} from 'rxjs';
import BigNumber from 'bignumber.js';
import {getKey} from '../utils/pools-utils';
import {Router} from '@angular/router';
import {MatDialog} from "@angular/material/dialog";
import {TransactionConfirmationComponent} from "../../shared/components/transaction-confirmation/transaction-confirmation.component";

const REEF_TOKEN = '0x894a180Cf0bdf32FF6b3268a1AE95d2fbC5500ab';

@Injectable({
  providedIn: 'root'
})
export class UniswapService {
  readonly routerContract$ = this.connectorService.uniswapRouterContract$;
  readonly farmingContract$ = this.connectorService.farmingContract$;
  readonly slippagePercent$ = new BehaviorSubject<string | null>(this.getSlippageIfSet());
  readonly web3 = this.connectorService.web3;
  readonly pendingTx$ = this.connectorService.pendingTransaction$;

  constructor(private readonly connectorService: ConnectorService,
              private readonly notificationService: NotificationService,
              private readonly router: Router,
              public dialog: MatDialog) {
  }

  public async buyReef(tokenSymbol: string, amount: number, minutesDeadline: number): Promise<void> {
    if (addresses[tokenSymbol]) {
      const weiAmount = this.connectorService.toWei(amount);
      const checkSummed = this.web3.utils.toChecksumAddress(addresses[tokenSymbol]);
      const REEF = new Token(ChainId.MAINNET, REEF_TOKEN, 18);
      const tokenB = await Fetcher.fetchTokenData(ChainId.MAINNET, checkSummed);
      const pair = await Fetcher.fetchPairData(REEF, tokenB);
      const route = new Route([pair], tokenB);
      const trade = new Trade(route, new TokenAmount(tokenB, weiAmount), TradeType.EXACT_INPUT);
      const slippageTolerance = new Percent(`${(+this.slippagePercent$.value * 10)}`, '1000');
      const amountOutMin = trade.minimumAmountOut(slippageTolerance).toFixed(0);
      const amountIn = trade.maximumAmountIn(slippageTolerance).toFixed(0);
      const path = [tokenB.address, REEF.address];
      const to = this.connectorService.providerUserInfo$.value.address;
      const deadline = getUnixTime(addMinutes(new Date(), minutesDeadline));
      try {
        const dialogRef = this.dialog.open(TransactionConfirmationComponent);
        if (tokenSymbol === 'WETH') {
          this.routerContract$.value.methods.swapExactETHForTokens(
            amountOutMin, path, to, deadline
          ).send({
            from: to,
            value: weiAmount,
            gasPrice: this.connectorService.getGasPrice()
          })
            .on('confirmation', (cNumber, receipt) => {
              dialogRef.close();
              this.notificationService.showNotification('The transaction is now confirmed!.', 'Ok', 'info')
            })
            .on('transactionHash', (hash) => {
              dialogRef.close();
              this.notificationService.showNotification('The transaction is now pending.', 'Ok', 'info')
              this.connectorService.setPendingTxs(hash);
            })
            .on('receipt', (receipt) => {
              this.connectorService.deletePending();
              this.notificationService.showNotification(`You've successfully bought ${amount} REEF!`, 'Okay', 'success');
            })
            .on('error', (err) => {
              dialogRef.close();
              this.notificationService.showNotification('The tx did not go through', 'Close', 'error');
            })
        } else {
          this.routerContract$.value.methods.swapExactTokensForTokens(
            +amount, amountOutMin, path, to, deadline
          ).send({
            from: to,
            gasPrice: this.connectorService.getGasPrice()
          })
            .on('confirmation', (cNumber, receipt) => {
              dialogRef.close();
              this.notificationService.showNotification('The transaction is now confirmed!.', 'Ok', 'info')
            })
            .on('transactionHash', (hash) => {
              dialogRef.close();
              this.notificationService.showNotification('The transaction is now pending.', 'Ok', 'info')
              this.connectorService.setPendingTxs(hash);
            })
            .on('receipt', (receipt) => {
              this.connectorService.deletePending();
              this.notificationService.showNotification(`You've successfully bought ${amount} REEF!`, 'Okay', 'success');
            })
            .on('error', (err) => {
              dialogRef.close();
              this.notificationService.showNotification('The tx did not go through', 'Close', 'error');
            })
        }
      } catch (e) {
        this.notificationService.showNotification('The tx did not go through', 'Close', 'error');
      }
    }
  }

  public createLpContract(tokenSymbol: string): IContract {
    return this.connectorService.createLpContract(tokenSymbol);
  }

  public async approveToken(token: IContract): Promise<any> {
    return await this.connectorService
      .approveToken(token, this.routerContract$.value.options.address);
  }

  public async getReefPairWith(tokenSymbol: string, reefAmount: string, tokenBAmount: string): Promise<any> {
    const REEF = new Token(ChainId.MAINNET, REEF_TOKEN, 18);
    const tokenB = new Token(ChainId.MAINNET, addresses[tokenSymbol], 18);
    const pair = await Fetcher.fetchPairData(REEF, tokenB);
    console.log(Pair.getAddress(REEF, tokenB), 'PAIR ADDRESS');
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
  }

  public async getReefPricePer(tokenSymbol: string, amount?: number): Promise<IReefPricePerToken> {
    if (addresses[tokenSymbol]) {
      const checkSummed = this.web3.utils.toChecksumAddress(addresses[tokenSymbol]);
      const REEF = new Token(ChainId.MAINNET, REEF_TOKEN, 18);
      const tokenB = await Fetcher.fetchTokenData(ChainId.MAINNET, checkSummed);
      const pair = await Fetcher.fetchPairData(REEF, tokenB);
      const route = new Route([pair], tokenB);
      const totalReef = await pair.reserveOf(REEF).toExact();
      if (amount) {
        const weiAmount = this.connectorService.toWei(amount);
        const trade = new Trade(route, new TokenAmount(tokenB, weiAmount), TradeType.EXACT_INPUT);
        const slippageTolerance = new Percent(`${(+this.slippagePercent$.value * 10)}`, '1000');
        const amountOutMin = trade.minimumAmountOut(slippageTolerance).toFixed(0);
        return {
          REEF_PER_TOKEN: route.midPrice.toSignificant(),
          TOKEN_PER_REEF: route.midPrice.invert().toSignificant(),
          totalReefReserve: totalReef,
          amountOutMin: +amountOutMin,
        };
      }
      return {
        REEF_PER_TOKEN: route.midPrice.toSignificant(),
        TOKEN_PER_REEF: route.midPrice.invert().toSignificant(),
        totalReefReserve: totalReef,
      };
    }
  }

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
        .on('confirmation', (cNumber, receipt) => {
          dialogRef.close();
          this.notificationService.showNotification('The transaction is now confirmed!.', 'Ok', 'info')
        })
        .on('transactionHash', (hash) => {
          dialogRef.close();
          this.notificationService.showNotification('The transaction is now pending.', 'Ok', 'info')
          this.connectorService.setPendingTxs(hash);
        })
        .on('receipt', (receipt) => {
          this.connectorService.deletePending();
          this.notificationService.showNotification(`You've successfully added liquidity to the pool`, 'Okay', 'success');
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
    const tokenSlippage = this.getSlippage(tokenAmount);
    const ethSlippage = this.getSlippage(weiEthAmount);
    try {
      const dialogRef = this.dialog.open(TransactionConfirmationComponent);
      this.routerContract$.value.methods.addLiquidityETH(
        token, tokenAmount, tokenSlippage, ethSlippage, to, deadline
      ).send({
        from: to,
        value: `${weiEthAmount}`,
        gasPrice: this.connectorService.getGasPrice()
      })
        .on('confirmation', (cNumber, receipt) => {
          dialogRef.close();
          this.notificationService.showNotification('The transaction is now confirmed!.', 'Ok', 'info')
        })
        .on('transactionHash', (hash) => {
          dialogRef.close();
          this.notificationService.showNotification('The transaction is now pending.', 'Ok', 'info')
          this.connectorService.setPendingTxs(hash);
        })
        .on('receipt', (receipt) => {
          this.connectorService.deletePending();
          this.notificationService.showNotification(`You've successfully added liquidity to the pool`, 'Okay', 'success');
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
      console.log(amount, 'amount');
      try {
        const dialogRef = this.dialog.open(TransactionConfirmationComponent);
        const poolSymbol = getKey(addresses, poolAddress);
        this.farmingContract$.value.methods.deposit(reefPools[poolSymbol], amount).send({
          from: this.connectorService.providerUserInfo$.value.address,
        })
          .on('confirmation', (cNumber, receipt) => {
            dialogRef.close();
            this.notificationService.showNotification('The transaction is now confirmed!.', 'Ok', 'info')
          })
          .on('transactionHash', (hash) => {
            dialogRef.close();
            this.notificationService.showNotification('The transaction is now pending.', 'Ok', 'info')
            this.connectorService.setPendingTxs(hash);
          })
          .on('receipt', (receipt) => {
            this.connectorService.deletePending();
            this.notificationService.showNotification(`You've successfully deposited ${tokenAmount}`, 'Okay', 'success');
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
      this.farmingContract$.value.methods.withdraw(reefPools[poolSymbol], amount).send({
        from: this.connectorService.providerUserInfo$.value.address,
        gasPrice: this.connectorService.getGasPrice()
      })
        .on('confirmation', (cNumber, receipt) => {
          dialogRef.close();
          this.notificationService.showNotification('The transaction is now confirmed!', 'Ok', 'info')
        })
        .on('transactionHash', (hash) => {
          dialogRef.close();
          this.notificationService.showNotification('The transaction is now pending.', 'Ok', 'info')
          this.connectorService.setPendingTxs(hash);
        })
        .on('receipt', (receipt) => {
          this.connectorService.deletePending();
          this.notificationService.showNotification(`You've withdrawn ${tokenAmount}`, 'Okay', 'success');
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
    const poolSymbol = getKey(addresses, poolAddress);
    return await this.farmingContract$.value.methods.userInfo(reefPools[poolSymbol], address).call<number>();
  }

  public isSupportedERC20(address: string): boolean {
    return !!getKey(addresses, address);
  }

  public setSlippage(percent: string): void {
    this.slippagePercent$.next(percent);
    localStorage.setItem('reef_slippage', `${percent}`);
  }

  private getSlippage(amount: string | number): string {
    return new BigNumber(amount).multipliedBy(+this.slippagePercent$.value / 100).toString();
  }

  private goToReef(): void {
    this.router.navigate(['/reef']);
  }

  private getSlippageIfSet(): string {
    return localStorage.getItem('reef_slippage') || '0.5';
  }

}
