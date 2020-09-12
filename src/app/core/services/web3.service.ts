import { Injectable } from '@angular/core';

const Web3 = require('web3');
import Web3Modal from 'web3modal';

@Injectable({
  providedIn: 'root'
})
export class Web3Service {
  private readonly web3: any;
  private account: any = null;
  public isMetaMaskConnected = false;

  constructor() {
    if (window.ethereum === undefined) {
      alert('Non-Ethereum browser detected. Install MetaMask');
    } else {
      if (typeof window.web3 !== 'undefined') {
        this.web3 = new Web3(window.web3.currentProvider);
      } else {
        this.web3 = new Web3.providers.HttpProvider('https://rinkeby.infura.io/v3/bd80ce1ca1f94da48e151bb6868bb150');
      }
      window.web3 = new Web3(window.ethereum);
      this.isMetaMaskConnected = !!window.ethereum.selectedAddress;
    }
  }

  public async enableMetaMaskAccount(): Promise<any> {
    return await window.ethereum.request({method: 'eth_requestAccounts'});
  }

  private async getAccount(): Promise<any> {
    if (this.account === null) {
      const response = await this.web3.eth.getAccounts();
      this.account = response[0];
    }
    return this.account;
  }

  public async getUserBalance(): Promise<any> {
    const account = await this.getAccount();
    return await this.web3.eth.getBalance(account);
  }

}

declare const require: any;
declare const window: any;
