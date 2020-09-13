import { Injectable } from '@angular/core';
import Web3 from 'web3';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { getProviderName } from '../utils/provider-name';
import { BehaviorSubject } from 'rxjs';
import { IProviderUserInfo } from '../models/types';
const Web3Modal = window.Web3Modal.default;
@Injectable({
  providedIn: 'root'
})
export class ConnectorService {
  currentProvider$ = new BehaviorSubject(null);
  currentProviderName$ = new BehaviorSubject<string | null>(null);
  providerUserInfo$ = new BehaviorSubject<IProviderUserInfo | null>(null);
  providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId: '8043bb2cf99347b1bfadfb233c5325c0'
      }
    }
  };
  web3Modal = null;
  web3 = null;

  constructor() {
    this.initWeb3Modal().then(() => {
      this.subToProviderEvents();
    });
  }

  public async onConnect(): Promise<any> {
    this.currentProvider$.next(await this.web3Modal.connect());
    this.initWeb3(this.currentProvider$.value);
    await this.getAddressAndBalance();
  }

  public async onDisconnect(): Promise<any> {
    this.currentProvider$.next(null);
    this.providerUserInfo$.next(null);
    this.currentProviderName$.next(null);
    if (this.web3.currentProvider.close) {
      await this.web3.currentProvider.close();
    }
    await this.web3Modal.clearCachedProvider();
    console.log('damn');
  }

  private async initWeb3Modal(): Promise<any> {
    this.web3Modal = new Web3Modal({
      providerOptions: this.providerOptions,
      // cacheProvider: true,
      disableInjectedProvider: false
    });
    await this.onConnect();
  }

  private initWeb3(provider: any): any {
    this.web3 = new Web3(provider);
    this.currentProvider$.next(provider);
    this.web3.eth.extend({
      methods: [
        {
          name: 'chainId',
          call: 'eth_chainId',
          outputFormatter: this.web3.utils.hexToNumber
        }
      ]
    });
    this.currentProviderName$.next(getProviderName(this.web3));
    console.log(this.currentProviderName$.value);
  }

  private subToProviderEvents(): void {
    if (this.currentProvider$.value.on) {
      return;
    }
    this.currentProvider$.value.on('connect', () => {
      console.log('connected!');
    });
    this.currentProvider$.value.on('disconnect', () => this.onDisconnect());
    this.currentProvider$.value.on('accountsChanged', (accounts: string[]) => {
      console.log(accounts);
    });
    this.currentProvider$.value.on('chainChanged', (chainId: number) => {
      console.log(chainId);
    });
    this.currentProvider$.value.on('networkChanged', async (networkId: number) => {
      console.log(networkId);
    });
  }

  private async getAddressAndBalance(): Promise<void> {
    const addresses = await this.web3.eth.getAccounts();
    const balance = await this.getUserBalance(addresses[0]);
    this.providerUserInfo$.next({
      address: addresses[0],
      balance,
    });
  }

  private async getUserBalance(address: string): Promise<string> {
    return await this.web3.eth.getBalance(address);
  }
}

declare const window;
