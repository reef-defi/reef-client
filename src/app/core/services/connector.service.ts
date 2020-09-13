import { Injectable } from '@angular/core';
import Web3 from 'web3';
import WalletConnectProvider from '@walletconnect/web3-provider';
import WalletLink from 'walletlink';
import { getProviderName } from '../utils/provider-name';
import { BehaviorSubject } from 'rxjs';
import { IChainData, IProviderUserInfo } from '../models/types';
import { getChainData } from '../utils/chains';

const Web3Modal = window.Web3Modal.default;

@Injectable({
  providedIn: 'root'
})
export class ConnectorService {
  currentProvider$ = new BehaviorSubject(null);
  currentProviderName$ = new BehaviorSubject<string | null>(null);
  providerUserInfo$ = new BehaviorSubject<IProviderUserInfo | null>(null);
  walletLink = new WalletLink({
    appName: 'reef.finance',
  });
  WalletLinkProvider = this.walletLink.makeWeb3Provider('https://rinkeby.infura.io/v3/bd80ce1ca1f94da48e151bb6868bb150', 4);
  providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId: '8043bb2cf99347b1bfadfb233c5325c0'
      },
    },
    'custom-walletlink': {
      display: {
        name: 'Wallet Link',
        description: 'Connect to your wallet link provider'
      },
      package: this.WalletLinkProvider,
      connector: async (ProvidePackage, options) => {
        console.log(this.WalletLinkProvider);
        const provider = new ProvidePackage(options);
        await provider.enable();
        return provider;
      }
    },
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
    await this.getUserProviderInfo();
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

  private async getUserProviderInfo(): Promise<void> {
    const address = await this.getAddress();
    const balance = await this.getUserBalance(address);
    const chainInfo = await this.getChainInfo();
    this.providerUserInfo$.next({
      address,
      balance,
      chainInfo,
    });
    console.log(this.providerUserInfo$.value, 'VAL');
  }

  private async getUserBalance(address: string): Promise<string> {
    const balance = await this.web3.eth.getBalance(address);
    return await this.web3.utils.fromWei(balance);
  }

  private async getAddress(): Promise<string> {
    const addresses = await this.web3.eth.getAccounts();
    return addresses[0];
  }

  private async getChainInfo(): Promise<IChainData> {
    const chainId = await this.web3.eth.getChainId();
    return getChainData(chainId);
  }
}

declare const window;
