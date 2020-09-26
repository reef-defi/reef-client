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
    const promises = [];
    const invested = [];
    for (let i = 0; i <= basketCount; i++) {
      promises.push(this.getAvailableBasket(i));
      invested.push(this.getBalanceOf(i));
    }
    let baskets = await Promise.all(promises);
    let investedVals = await Promise.all(invested);
    baskets = baskets.map((basket) => convertContractBasket(basket, this.basketService.tokens$.value)).map((basket, idx) => ({
      ...basket,
      investedVals: investedVals[idx]
    }));
    this.baskets$.next(baskets);
    console.log(this.baskets$.value);
  }

  getAvailableBasketsCount(): Promise<any> {
    return this.contract$.value.methods.getAvailableBasketsCount().call();
  }

  getAvailableBasket(basketIdx: number): Promise<any> {
    return this.contract$.value.methods.getAvailableBasket(basketIdx).call();
  }

  async createBasket(name: string, basketPoolTokenInfo: IBasketPoolsAndCoinInfo): Promise<any> {
    try {
      const {uniswapPools, tokenPools, balancerPools, balancerWeights, tokenWeights, uniSwapWeights} = basketPoolTokenInfo;
      const response = await this.contract$.value.methods
        .createBasket(name, uniswapPools, uniSwapWeights, tokenPools, tokenWeights, balancerPools, balancerWeights)
        .send({from: this.connectorService.providerUserInfo$.value.address});
      this.transactionInterval = setInterval(async () => await this.checkIfTransactionSuccess(response.transactionHash), 1000);
    } catch (e) {
      this.notificationService.showNotification(e.message, 'Close', 'error');
    }
  }

  getBalanceOf(basketIdx): Promise<any> {
    console.log(this.connectorService.providerUserInfo$.value.address, 'ADDR???')
    return this.contract$.value.methods.balanceOf(this.connectorService.providerUserInfo$.value.address, basketIdx).call();
  }

  async investInBasket(basketIdxs: number[], weights: number[], amount: number): Promise<any> {
    try {
      const wei = await this.connectorService.toWei(amount);
      console.log('0x0000000000000000000000000000000000000000', basketIdxs, weights, wei, 1)
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
        'Hello',
        [20, 20, 60],
        [
          ['0xc2118d4d90b274016cB7a54c03EF52E6c537D957', '0xc778417E063141139Fce010982780140Aa0cD5Ab'],
          ['0xBde8bB00A7eF67007A96945B3a3621177B615C44', '0xc778417E063141139Fce010982780140Aa0cD5Ab'],
        ],
        ['0x516de3a7A567d81737e3a46ec4FF9cFD1fcb0136'])
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
