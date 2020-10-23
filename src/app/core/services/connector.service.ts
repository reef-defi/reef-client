import { Injectable } from '@angular/core';
import Web3 from 'web3';
import WalletConnectProvider from '@walletconnect/web3-provider';
import WalletLink from 'walletlink';
import { getProviderName } from '../utils/provider-name';
import { BehaviorSubject } from 'rxjs';
import { IChainData, IContract, IProviderUserInfo } from '../models/types';
import { getChainData } from '../utils/chains';
import { NotificationService } from './notification.service';
import { contractData } from '../../../assets/abi';

const Web3Modal = window.Web3Modal.default;

@Injectable({
  providedIn: 'root'
})
export class ConnectorService {
  basketContract$ = new BehaviorSubject<IContract>(null);
  stakingContract$ = new BehaviorSubject<IContract>(null);
  farmingContract$ = new BehaviorSubject<IContract>(null);
  reefTokenContract$ = new BehaviorSubject<IContract>(null);
  currentProvider$ = new BehaviorSubject(null);
  currentProviderName$ = new BehaviorSubject<string | null>(null);
  providerUserInfo$ = new BehaviorSubject<IProviderUserInfo | null>(null);
  walletLink = new WalletLink({
    appName: 'reef.finance',
  });
  WalletLinkProvider = this.walletLink.makeWeb3Provider('https://ropsten.infura.io/v3/eadc555e1ec7423f94e94d8a06a2f310', 4);
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
        description: 'Scan with WalletLink to connect'
      },
      package: this.WalletLinkProvider,
      connector: async (provider, options) => {
        console.log(this.WalletLinkProvider);
        await provider.enable();
        return provider;
      }
    },
  };
  public web3Modal = null;
  public web3 = null;

  constructor(private readonly notificationService: NotificationService) {
    this.web3Modal = new Web3Modal({
      providerOptions: this.providerOptions,
      cacheProvider: true,
      disableInjectedProvider: false
    });
    if (this.web3Modal.cachedProvider) {
      this.onConnect();
    }
  }


  public async onConnect(): Promise<any> {
    this.currentProvider$.next(await this.web3Modal.connect());
    this.initWeb3(this.currentProvider$.value);
    this.connectToContract();
    this.subToProviderEvents();
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

  public async getTransactionReceipt(txHash: string): Promise<any> {
    return await this.web3.eth.getTransactionReceipt(txHash);
  }

  public toWei(amount: number, unit = 'ether'): Promise<any> {
    return this.web3.utils.toWei(`${amount}`, unit);
  }

  public fromWei(amount: number, unit = 'ether'): Promise<any> {
    return this.web3.utils.fromWei(`${amount}`, unit);
  }

  public async getUserProviderInfo(): Promise<void> {
    const address = await this.getAddress();
    const balance = await this.getUserBalance(address);
    const chainInfo = await this.getChainInfo();
    const reefBalance = await this.getReefBalance(address);
    this.providerUserInfo$.next({
      address,
      balance,
      chainInfo,
      reefBalance,
    });
    console.log(this.providerUserInfo$.value, 'VAL');
  }

  private connectToContract(): void {
    const basketsC = new this.web3.eth.Contract((contractData.reefBasket.abi as any), contractData.reefBasket.addr);
    const farmingC = new this.web3.eth.Contract((contractData.reefFarming.abi as any), contractData.reefFarming.addr);
    const stakingC = new this.web3.eth.Contract((contractData.reefStaking.abi as any), contractData.reefStaking.addr);
    const tokenC = new this.web3.eth.Contract((contractData.reefToken.abi as any), contractData.reefToken.addr);
    this.basketContract$.next(basketsC);
    this.farmingContract$.next(farmingC);
    this.stakingContract$.next(stakingC);
    this.reefTokenContract$.next(tokenC);
  }

  private async initWeb3Modal(): Promise<any> {
    this.web3Modal = new Web3Modal({
      providerOptions: this.providerOptions,
      cacheProvider: true,
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
    this.notificationService.showNotification(`${this.currentProviderName$.value} wallet connected.`, 'Okay!', 'success');
    console.log(this.currentProviderName$.value);
  }

  private subToProviderEvents(): void {
    if (!this.currentProvider$.value.on) {
      return;
    }
    this.currentProvider$.value.on('connect', () => {
    });
    this.currentProvider$.value.on('disconnect', () => this.onDisconnect());
    this.currentProvider$.value.on('accountsChanged', async (accounts: string[]) => {
      window.location.reload();
    });
    this.currentProvider$.value.on('chainChanged', (chainId: number) => {
      console.log(chainId);
      window.location.reload();
    });
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

  private async getReefBalance(address: string): Promise<number> {
    const balance = await this.reefTokenContract$.value.methods.balanceOf(address).call();
    return await this.web3.utils.fromWei(balance);
  }
}

declare const window;
