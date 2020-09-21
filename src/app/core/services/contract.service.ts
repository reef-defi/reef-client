import { Injectable } from '@angular/core';
import { contractData } from '../../../assets/abi';
import { ConnectorService } from './connector.service';
import { BehaviorSubject } from 'rxjs';
import has = Reflect.has;

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  contract$ = new BehaviorSubject(null);
  baskets$ = new BehaviorSubject(null);

  constructor(private readonly connectorService: ConnectorService) {
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

  createBasket(name: string, weights: string[] | number[], uniswapPools: string[][], tokens: string[]): Promise<any> {
    return this.contract$.value.methods.createBasket(name, weights, uniswapPools, tokens).call();
  }

  getBalanceOf(ownerAddr: string, basketIdx): Promise<any> {
    return this.contract$.value.methods.balanceOf(ownerAddr, basketIdx).call();
  }

  invest(fromTokenAddr: string, basketIdxs: number[], weights: number[], amount: number, minPoolTokens: any, msg): Promise<any> {
    return this.contract$.value.methods.invest(fromTokenAddr, basketIdxs, weights, amount, minPoolTokens, msg).call();
  }

  async createBasketTest(): Promise<any> {
    try {
      const cont = await this.contract$.value.methods.createBasket(
        'Hello', [20, 20, 60], [
          ['0xc2118d4d90b274016cB7a54c03EF52E6c537D957', '0xc778417E063141139Fce010982780140Aa0cD5Ab'],
          ['0xBde8bB00A7eF67007A96945B3a3621177B615C44', '0xc778417E063141139Fce010982780140Aa0cD5Ab'],
        ], ['0x516de3a7A567d81737e3a46ec4FF9cFD1fcb0136']).send({from: this.connectorService.providerUserInfo$.value.address});
      const receipt = await this.connectorService.getTransactionReceipt(cont.transactionHash);
      if (receipt && receipt.status) {
        alert('Transaction completed!');
      }
    } catch (e) {
      alert(e.message);
    }
  }

}
