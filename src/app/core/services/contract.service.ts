import { Injectable } from '@angular/core';
import { contractData } from '../../../assets/abi';
import { ConnectorService } from './connector.service';
import { BehaviorSubject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from './notification.service';
import { IBasketPoolsAndCoinInfo } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  contract$ = new BehaviorSubject(null);
  baskets$ = new BehaviorSubject(null);
  transactionInterval = null;

  constructor(
    private readonly connectorService: ConnectorService,
    private readonly notificationService: NotificationService) {
  }

  connectToContract(): void {
    const contract = new this.connectorService.web3.eth.Contract((contractData.abi as any), contractData.addr);
    this.contract$.next(contract);
  }

  async getAllBaskets(): Promise<any> {
    const basketCount = (await this.getAvailableBasketsCount()) - 1;
    const promises = [];
    for (let i = 0; i <= basketCount; i++) {
      promises.push(this.getAvailableBasket(i));
    }
    this.baskets$.next(await Promise.all(promises));
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

  getBalanceOf(ownerAddr: string, basketIdx): Promise<any> {
    return this.contract$.value.methods.balanceOf(ownerAddr, basketIdx).call();
  }

  investInBasket(fromTokenAddr: string, basketIdxs: number[], weights: number[], amount: number): Promise<any> {
    return this.contract$.value.methods.invest(
      '0x0000000000000000000000000000000000000000',
      basketIdxs,
      weights,
      this.connectorService.web3.utils.toWei(amount, 'ether'),
      0)
      .send({amount: `${amount} ether`, from: this.connectorService.providerUserInfo$.value.address});
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
    const receipt = await this.connectorService.getTransactionReceipt(hash);
    if (receipt && receipt.status) {
      this.notificationService.showNotification(`Transaction with hash: ${hash} successful`, 'Okay', 'success');
      clearInterval(this.transactionInterval);
    }
  }

}
