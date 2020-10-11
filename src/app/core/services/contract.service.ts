import { Injectable } from '@angular/core';
import { contractData } from '../../../assets/abi';
import { ConnectorService } from './connector.service';
import { BehaviorSubject } from 'rxjs';
import { NotificationService } from './notification.service';
import { IBasket, IBasketPoolsAndCoinInfo } from '../models/types';
import { convertContractBasket } from '../utils/pools-utils';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  contract$ = new BehaviorSubject(null);
  baskets$ = new BehaviorSubject<IBasket[] | null>(null);
  transactionInterval = null;

  constructor(
    private readonly connectorService: ConnectorService,
    private readonly notificationService: NotificationService,
    private readonly basketService: ApiService) {
  }

  connectToContract(): void {
    const contract = new this.connectorService.web3.eth.Contract((contractData.abi as any), contractData.addr);
    this.contract$.next(contract);
  }

  async getAllBaskets(): Promise<any> {
    const basketCount = (await this.getAvailableBasketsCount()) - 1;
    console.log(basketCount, 'basketCount');
    const promises = [];
    const invested = [];
    for (let i = 0; i <= basketCount; i++) {
      promises.push(this.getAvailableBasket(i));
      invested.push(this.getBalanceOf(i));
    }
    let baskets = await Promise.all(promises);
    console.log(baskets);
    const investedVals = await Promise.all(invested);
    baskets = baskets.map((basket) => convertContractBasket(basket, this.basketService.tokens$.value)).map((basket, idx) => ({
      ...basket,
      investedVals: investedVals[idx]
    }));
    this.baskets$.next(baskets);
    console.log(this.baskets$.value);
  }

  getAvailableBasketsCount(): Promise<any> {
    console.log(this.contract$.value, 'size');
    return this.contract$.value.methods.availableBaskets(0).call();
  }

  getAvailableBasket(basketIdx: number): Promise<any> {
    return this.contract$.value.methods.getAvailableBasket(basketIdx).call();
  }

  async createBasket(name: string, basketPoolTokenInfo: IBasketPoolsAndCoinInfo): Promise<any> {
    try {
      const {uniswapPools, tokenPools, balancerPools, balancerWeights, tokenWeights, uniSwapWeights, mooniswapPools, mooniswapWeights}
        = basketPoolTokenInfo;
      console.log(name, uniswapPools, uniSwapWeights, tokenPools, tokenWeights, balancerPools, balancerWeights, mooniswapPools, mooniswapWeights);

      const response = await this.contract$.value.methods
        .createBasket(name, uniswapPools, uniSwapWeights, tokenPools, tokenWeights, balancerPools, balancerWeights, mooniswapPools, mooniswapWeights)
        .send({
          from: this.connectorService.providerUserInfo$.value.address, gas: 500000,
        });
      this.transactionInterval = setInterval(async () => await this.checkIfTransactionSuccess(response.transactionHash), 1000);
    } catch (e) {
      this.notificationService.showNotification(e.message, 'Close', 'error');
    }
  }

  getBalanceOf(basketIdx): Promise<any> {
    console.log(this.connectorService.providerUserInfo$.value.address, 'ADDR???');
    return this.contract$.value.methods.balanceOf(this.connectorService.providerUserInfo$.value.address, basketIdx).call();
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

  private async checkIfTransactionSuccess(hash: string): Promise<any> {
    if (!hash) {
      this.notificationService.showNotification('Something went wrong.', 'Close', 'error');
      clearInterval(this.transactionInterval);
    }
    const receipt = await this.connectorService.getTransactionReceipt(hash);
    if (receipt && receipt.status) {
      this.notificationService.showNotification(`Tx Hash: ${hash}`, 'Okay', 'success');
      clearInterval(this.transactionInterval);
    }
  }


}
