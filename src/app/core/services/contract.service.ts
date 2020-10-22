import { Injectable } from '@angular/core';
import { ConnectorService } from './connector.service';
import { BehaviorSubject } from 'rxjs';
import { NotificationService } from './notification.service';
import { IBasket, IBasketPoolsAndCoinInfo } from '../models/types';
import { getBasketPoolNames, MaxUint256 } from '../utils/pools-utils';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  basketContract$ = this.connectorService.basketContract$;
  farmingContract$ = this.connectorService.farmingContract$;
  stakingContract$ = this.connectorService.stakingContract$;
  reefTokenContract$ = this.connectorService.reefTokenContract$;
  baskets$ = new BehaviorSubject<IBasket[] | null>(null);
  readonly basketsError$ = new BehaviorSubject(null);
  readonly loading$ = new BehaviorSubject(false);
  transactionInterval = null;

  constructor(
    private readonly connectorService: ConnectorService,
    private readonly notificationService: NotificationService,
    private readonly apiService: ApiService) {
  }


  async getAllBaskets(): Promise<any> {
    this.loading$.next(true);
    try {
      const basketCount = await this.getAvailableBasketsCount();
      const basketProms = [];
      for (let i = 0; i <= basketCount; i++) {
        basketProms.push(this.getAvailableBasket(i));
      }
      const resolvedBaskets = await Promise.all(basketProms);
      let baskets: IBasket[] = await Promise.all(resolvedBaskets.map(async (basket, idx) => ({
        ...basket,
        investedETH: await this.getUserInvestedBasketAmount(idx),
        ...(await this.getBasketPoolsAndTokens(idx)).reduce((memo, curr) => ({...memo, ...curr})),
        index: idx,
      })));
      baskets = getBasketPoolNames(baskets, this.apiService.pools$.value, this.apiService.tokens$.value)
        .filter(basket => +basket.investedETH > 0);
      this.baskets$.next(baskets);
      this.basketsError$.next(false);
      this.loading$.next(false);
    } catch (e) {
      this.basketsError$.next(true);
      this.loading$.next(false);
    }
    console.log(this.baskets$.value);
  }

  async resetBaskets(): Promise<any> {
    this.baskets$.next([]);
  }

  getAvailableBasketsCount(): Promise<any> {
    return this.basketContract$.value.methods.availableBasketsSize().call();
  }

  getAvailableBasket(basketIdx: number): Promise<any> {
    return this.basketContract$.value.methods.availableBaskets(basketIdx).call();
  }

  async getUserInvestedBasketAmount(idx: number): Promise<any> {
    const invested: number = await this.basketContract$.value.methods
      .investedAmountInBasket(this.connectorService.providerUserInfo$.value.address, idx).call();
    return await this.connectorService.fromWei(invested);
  }

  async createBasket(name: string, basketPoolTokenInfo: IBasketPoolsAndCoinInfo, amountToInvest: number): Promise<any> {
    try {
      const wei = this.connectorService.toWei(amountToInvest);
      const {uniswapPools, tokenPools, balancerPools, balancerWeights, tokenWeights, uniSwapWeights, mooniswapPools, mooniswapWeights}
        = basketPoolTokenInfo;
      console.log(this.basketContract$.value.options.jsonInterface, 'FROM_CREATE');
      const response = await this.basketContract$.value.methods
        .createBasket(
          name, uniswapPools, uniSwapWeights, tokenPools, tokenWeights, balancerPools, balancerWeights, mooniswapPools, mooniswapWeights)
        .send({
          from: this.connectorService.providerUserInfo$.value.address.toLocaleLowerCase(),
          value: `${wei}`,
          gas: 6721975,
        });
      this.transactionInterval = setInterval(async () =>
        await this.checkIfTransactionSuccess(response.transactionHash, ['updateUserDetails']), 1000);
    } catch (e) {
      console.error(e);
      this.notificationService.showNotification(e.message, 'Close', 'error');
    }
  }

  getBalanceOf(basketIdx): Promise<any> {
    // TODO: get balances of all polls...
    console.log(this.connectorService.providerUserInfo$.value.address, 'ADDR???');
    return this.basketContract$.value.methods.getAvailableBasketUniswapPools(basketIdx).call();
  }

  async getBasketPoolsAndTokens(basketIdx: number): Promise<any[]> {
    const fns = [
      'getAvailableBasketUniswapPools', 'getAvailableBasketTokens', 'getAvailableBasketBalancerPools', 'getAvailableBasketMooniswapPools',
    ];
    const unpack = async (fn) => {
      const res = await this.basketContract$.value.methods[fn](basketIdx).call();
      return {
        pools: res[0],
        weights: res[1],
      };
    };
    return Promise.all(fns.map(async (fn: string) => ({
      [fn.split('Basket')[1]]: await unpack(fn)
    })));
  }

  async disinvestInBasket(basketIdxs: number[], basketIdxPercentage: number[], yieldRatio: number): Promise<any> {
    try {
      console.log(basketIdxs, basketIdxPercentage, yieldRatio, 'Disinvest Params');
      const res = await this.basketContract$.value.methods.disinvest(
        basketIdxs,
        basketIdxPercentage,
        yieldRatio,
        1
      )
        .send({
          from: this.connectorService.providerUserInfo$.value.address,
          gas: 6721975,
        });
      this.transactionInterval = setInterval(async () => await this.checkIfTransactionSuccess(res.transactionHash, ['getAllBaskets', 'updateUserDetails']), 1000);
    } catch (e) {
      console.log(e);
      this.notificationService.showNotification(e.message, 'Close', 'error');
    }
  }

  async stakeReef(amount: number): Promise<any> {
    try {
      console.log(this.connectorService.providerUserInfo$.value, 'VALL...');
      const hey = await this.connectorService.toWei(amount);
      const res = await this.stakingContract$.value.methods.stake(hey)
        .send({
          from: this.connectorService.providerUserInfo$.value.address,
          gas: 6721975
        });
      this.transactionInterval = setInterval(async () =>
        await this.checkIfTransactionSuccess(res.transactionHash, ['updateUserDetails']), 1000);
    } catch (e) {
      console.log(e);
    }
  }

  async approveToken(token: any, spenderAddr: string): Promise<any> {
    const allowance = await this.getAllowance(token, spenderAddr);
    console.log(allowance, 'allowance');
    if (allowance && +allowance > 0) {
      return true;
    }
    return await token.methods.approve(
      spenderAddr,
      MaxUint256.toString()
    ).send({
      from: this.connectorService.providerUserInfo$.value.address, // hardcode
    });
  }


  private async getAllowance(token: any, spenderAddr: string): Promise<any> {
    return token.methods.allowance(this.connectorService.providerUserInfo$.value.address, spenderAddr).call();
  }

  private updateUserDetails() {
    this.connectorService.getUserProviderInfo();
  }

  private async checkIfTransactionSuccess(hash: string, fns?: string[]): Promise<any> {
    if (!hash) {
      this.notificationService.showNotification('Something went wrong.', 'Close', 'error');
      clearInterval(this.transactionInterval);
    }
    const receipt = await this.connectorService.getTransactionReceipt(hash);
    if (receipt && receipt.status) {
      if (fns && fns.length) {
        fns.forEach(fn => this[fn]());
      }
      this.notificationService.showNotification(`Tx Hash: ${hash}`, 'Okay', 'success');
      clearInterval(this.transactionInterval);
    }
  }
}
