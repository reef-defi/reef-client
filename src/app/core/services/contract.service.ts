import { Injectable } from '@angular/core';
import { ConnectorService } from './connector.service';
import { BehaviorSubject } from 'rxjs';
import { NotificationService } from './notification.service';
import { IBasket, IBasketPoolsAndCoinInfo } from '../models/types';
import { getBasketPoolNames } from '../utils/pools-utils';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  contract$ = this.connectorService.contract$;
  baskets$ = new BehaviorSubject<IBasket[] | null>(null);
  transactionInterval = null;

  constructor(
    private readonly connectorService: ConnectorService,
    private readonly notificationService: NotificationService,
    private readonly apiService: ApiService) {
  }

  async getAllBaskets(): Promise<any> {
    const basketCount = await this.getAvailableBasketsCount();
    const basketProms = [];
    for (let i = 0; i <= basketCount; i++) {
      basketProms.push(this.getAvailableBasket(i));
    }
    const resolvedBaskets = await Promise.all(basketProms);
    let baskets: IBasket[] = await Promise.all(resolvedBaskets.map(async (basket, idx) => ({
      ...basket,
      investedETH: await this.getUserInvestedBasketAmount(idx),
      ...(await this.getBasketPoolsAndTokens(idx)).reduce((memo, curr) => ({...memo, ...curr}))
    })));
    baskets = getBasketPoolNames(baskets, this.apiService.pools$.value, this.apiService.tokens$.value)
      .filter(basket => +basket.investedETH > 0);
    this.baskets$.next(baskets);
    console.log(this.baskets$.value);
  }

  async resetBaskets(): Promise<any> {
    this.baskets$.next([]);
  }

  getAvailableBasketsCount(): Promise<any> {
    return this.contract$.value.methods.availableBasketsSize().call();
  }

  getAvailableBasket(basketIdx: number): Promise<any> {
    return this.contract$.value.methods.availableBaskets(basketIdx).call();
  }

  async getUserInvestedBasketAmount(idx: number): Promise<any> {
    const invested = await this.contract$.value.methods.investedAmountInBasket(this.connectorService.providerUserInfo$.value.address, idx).call();
    return await this.connectorService.fromWei(invested);
  }

  async createBasket(name: string, basketPoolTokenInfo: IBasketPoolsAndCoinInfo, amountToInvest: number): Promise<any> {
    try {
      const wei = this.connectorService.toWei(amountToInvest);
      const {uniswapPools, tokenPools, balancerPools, balancerWeights, tokenWeights, uniSwapWeights, mooniswapPools, mooniswapWeights}
        = basketPoolTokenInfo;
      console.log(this.contract$.value.options.jsonInterface, 'FROM_CREATE');
      const response = await this.contract$.value.methods
        .createBasket(
          name, uniswapPools, uniSwapWeights, tokenPools, tokenWeights, balancerPools, balancerWeights, mooniswapPools, mooniswapWeights)
        .send({
          from: this.connectorService.providerUserInfo$.value.address.toLocaleLowerCase(),
          value: `${wei}`,
          gas: 6721975,
        });
      this.transactionInterval = setInterval(async () =>
        await this.checkIfTransactionSuccess(response.transactionHash, 'updateUserDetails'), 1000);
    } catch (e) {
      console.error(e);
      this.notificationService.showNotification(e.message, 'Close', 'error');
    }
  }

  getBalanceOf(basketIdx): Promise<any> {
    // TODO: get balances of all polls...
    console.log(this.connectorService.providerUserInfo$.value.address, 'ADDR???');
    return this.contract$.value.methods.getAvailableBasketUniswapPools(basketIdx).call();
  }

  async getBasketPoolsAndTokens(basketIdx: number): Promise<any[]> {
    const fns = [
      'getAvailableBasketUniswapPools', 'getAvailableBasketTokens', 'getAvailableBasketBalancerPools', 'getAvailableBasketMooniswapPools',
    ];
    const unpack = async (fn) => {
      const res = await this.contract$.value.methods[fn](basketIdx).call();
      return {
        pools: res[0],
        weights: res[1],
      };
    };
    return Promise.all(fns.map(async (fn: string) => ({
      [fn.split('Basket')[1]]: await unpack(fn)
    })));
  }

  async investInBasket(basketIdxs: number[], weights: number[], amount: number): Promise<any> {
    try {
      const wei = await this.connectorService.toWei(amount);
      console.log('0x0000000000000000000000000000000000000000', basketIdxs, weights, wei, 1);
      console.log('addr', this.connectorService.providerUserInfo$.value.address);
      const res = await this.contract$.value.methods.invest(
        '0x0000000000000000000000000000000000000000',
        basketIdxs,
        weights,
        wei,
        0xD467FB9
      )
        .send({value: wei, from: this.connectorService.providerUserInfo$.value.address});
      this.transactionInterval = setInterval(async () => await this.checkIfTransactionSuccess(res.transactionHash), 1000);
    } catch (e) {
      console.log(e);
      this.notificationService.showNotification(e.message, 'Close', 'error');
    }
  }

  async disinvestInBasket(basketIdxs: number[], basketIdxPercentage: number[], yieldRatio: number): Promise<any> {
    try {
      console.log(basketIdxs, basketIdxPercentage, yieldRatio, 'Disinvest Params');
      const res = await this.contract$.value.methods.disinvest(
        basketIdxs,
        basketIdxPercentage,
        yieldRatio,
        1
      )
        .send({
          from: this.connectorService.providerUserInfo$.value.address,
          gas: 6721975,
        });
      this.transactionInterval = setInterval(async () => await this.checkIfTransactionSuccess(res.transactionHash, 'getAllBaskets'), 1000);
    } catch (e) {
      console.log(e);
      this.notificationService.showNotification(e.message, 'Close', 'error');
    }
  }

  async createBasketTest(): Promise<any> {
    try {
      const response = await this.contract$.value.methods.createBasket(
        'Test_Basket',
        [20, 20, 60],
        [
          ['0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
          ['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', '0xdac17f958d2ee523a2206206994597c13d831ec7'],
        ],
        ['0x6b175474e89094c44da98b954eedeac495271d0f'])
        .send({from: this.connectorService.providerUserInfo$.value.address});
      this.transactionInterval = setInterval(async () => await this.checkIfTransactionSuccess(response.transactionHash), 1000);
    } catch (e) {
      this.notificationService.showNotification(e.message, 'Close', 'error');
    }
  }

  private updateUserDetails() {
    this.connectorService.getUserProviderInfo();
  }

  private async checkIfTransactionSuccess(hash: string, fn?: any): Promise<any> {
    if (!hash) {
      this.notificationService.showNotification('Something went wrong.', 'Close', 'error');
      clearInterval(this.transactionInterval);
    }
    const receipt = await this.connectorService.getTransactionReceipt(hash);
    if (receipt && receipt.status) {
      if (fn) {
        this[fn]();
      }
      this.notificationService.showNotification(`Tx Hash: ${hash}`, 'Okay', 'success');
      clearInterval(this.transactionInterval);
    }
  }
}
