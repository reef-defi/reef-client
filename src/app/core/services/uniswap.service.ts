import { Injectable } from '@angular/core';
import { ChainId, Fetcher, Pair, Price, Route, Token, TokenAmount, Trade, TradeType, WETH } from '@uniswap/sdk';
import { addresses, reefPools } from '../../../assets/addresses';
import { ConnectorService } from './connector.service';
import { IContract, IReefPricePerToken } from '../models/types';
import { NotificationService } from './notification.service';
import { addMinutes, getUnixTime } from 'date-fns';
import { BehaviorSubject, from } from 'rxjs';
import BigNumber from 'bignumber.js';
import { getKey } from '../utils/pools-utils';

const REEF_TOKEN = '0x894a180Cf0bdf32FF6b3268a1AE95d2fbC5500ab';

@Injectable({
  providedIn: 'root'
})
export class UniswapService {
  readonly routerContract$ = this.connectorService.uniswapRouterContract$;
  readonly farmingContract$ = this.connectorService.farmingContract$;
  readonly slippagePercent$ = new BehaviorSubject<number | null>(0.5);
  readonly web3 = this.connectorService.web3;
  transactionInterval = null;

  constructor(private readonly connectorService: ConnectorService,
              private readonly notificationService: NotificationService) {
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

  public async getReefPricePer(tokenSymbol: string): Promise<IReefPricePerToken> {
    if (addresses[tokenSymbol]) {
      const checkSummed = this.web3.utils.toChecksumAddress(addresses[tokenSymbol]);
      const REEF = new Token(ChainId.MAINNET, REEF_TOKEN, 18);
      const tokenB = new Token(ChainId.MAINNET, checkSummed, 18);
      const pair = await Fetcher.fetchPairData(REEF, tokenB);
      const route = new Route([pair], tokenB);
      return {
        REEF_PER_TOKEN: route.midPrice.toSignificant(),
        TOKEN_PER_REEF: route.midPrice.invert().toSignificant()
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
      const res = await this.routerContract$.value.methods.addLiquidity(
        tokenA, tokenB, weiA, weiB, weiA, weiB, to, deadline
      ).send({
        from: to,
        gas: 6721975
      });
      this.transactionInterval = setInterval(async () =>
        await this.checkIfTransactionSuccess(res, []), 1000);
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
      const res = await this.routerContract$.value.methods.addLiquidityETH(
        token, tokenAmount, tokenSlippage, ethSlippage, to, deadline
      ).send({
        from: to,
        gas: 6721975,
        value: `${weiEthAmount}`
      });
      this.transactionInterval = setInterval(async () =>
        await this.checkIfTransactionSuccess(res, []), 1000);
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
        const poolSymbol = getKey(addresses, poolAddress);
        console.log(reefPools[poolSymbol], amount, 'hello...');
        const res = await this.farmingContract$.value.methods.deposit(reefPools[poolSymbol], amount).send({
          from: this.connectorService.providerUserInfo$.value.address,
          gas: 6721975,
        });
        this.transactionInterval = setInterval(async () =>
          await this.checkIfTransactionSuccess(res, []), 1000);
      } catch (e) {
        this.notificationService.showNotification(e.message, 'Close', 'error');
      }
    }
  }

  public async withdraw(poolAddress: string, tokenAmount: string): Promise<any> {
    try {
      const amount = new BigNumber(tokenAmount).toNumber();
      const poolSymbol = getKey(addresses, poolAddress);
      const res = await this.farmingContract$.value.methods.withdraw(reefPools[poolSymbol], amount).send({
        from: this.connectorService.providerUserInfo$.value.address,
        gas: 6721975,
      });
      this.transactionInterval = setInterval(async () =>
        await this.checkIfTransactionSuccess(res, []), 1000);
    } catch (e) {
      this.notificationService.showNotification(e.message, 'Close', 'error');
    }
  }

  public async getReefRewards(poolAddress: string): Promise<number> {
    const address = this.connectorService.providerUserInfo$.value.address;
    const poolSymbol = getKey(addresses, poolAddress);
    const amount = await this.farmingContract$.value.methods.pendingRewards(reefPools[poolSymbol], address).call<number>();
    return this.connectorService.fromWei(amount);
  }

  public async getBalanceOf(tokenContract: IContract, ownerAddress: string): Promise<string> {
    const balance = await tokenContract.methods.balanceOf(ownerAddress).call<number>();
    return this.connectorService.fromWei(balance);
  }

  public isSupportedERC20(address: string): boolean {
    return !!getKey(addresses, address);
  }

  public setSlippage(percent: number): void {
    this.slippagePercent$.next(percent);
  }

  public async getERC20TokenBalance(contract: IContract, userAddress: string): Promise<string> {
    const balance = await contract.methods.balanceOf(userAddress).call();
    return await this.web3.utils.fromWei(balance);
  }

  private getSlippage(amount: string | number): string {
    return new BigNumber(amount).multipliedBy(this.slippagePercent$.value / 100).toString();
  }

  private async checkIfTransactionSuccess(tx: any, fns?: string[]): Promise<any> {
    console.log(tx);
    if (!tx.transactionHash) {
      this.notificationService.showNotification('Something went wrong.', 'Close', 'error');
      clearInterval(this.transactionInterval);
    }
    const receipt = await this.connectorService.getTransactionReceipt(tx.transactionHash);
    if (receipt && receipt.status) {
      if (fns && fns.length) {
        fns.forEach(fn => this[fn]());
      }
      this.notificationService.showNotification(`Tx Hash: ${tx.transactionHash}`, 'Okay', 'success');
      const latestTx = await this.connectorService.getTxByHash(tx.transactionHash);
      if (this.connectorService.transactionsForAccount$.value) {
        this.connectorService.transactionsForAccount$.next(
          [...this.connectorService.transactionsForAccount$.value, latestTx]
        );
      }
      clearInterval(this.transactionInterval);
    }
  }

}
