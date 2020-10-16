import { Injectable } from '@angular/core';
import Web3 from 'web3';
import WalletConnectProvider from '@walletconnect/web3-provider';
import WalletLink from 'walletlink';
import { getProviderName } from '../utils/provider-name';
import { BehaviorSubject } from 'rxjs';
import { IChainData, IProviderUserInfo } from '../models/types';
import { getChainData } from '../utils/chains';
import { NotificationService } from './notification.service';
import { contractData } from '../../../assets/abi';

const Web3Modal = window.Web3Modal.default;

@Injectable({
  providedIn: 'root'
})
export class ConnectorService {
  contract$ = new BehaviorSubject(null);
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
    this.initWeb3Modal().then(() => {
      this.subToProviderEvents();
      this.connectToContract();
    }).catch((err: any) => {
      this.notificationService.showNotification('To proceed, connect your wallet', 'Ok.', 'info');
    });
  }

  public async onConnect(): Promise<any> {
    this.currentProvider$.next(await this.web3Modal.connect())
    this.initWeb3(this.currentProvider$.value);
    await this.getUserProviderInfo();
    this.connectToContract();
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

  private connectToContract(): void {
    const contract = new this.web3.eth.Contract((contractData.abi as any), contractData.addr);
    this.contract$.next(contract);
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
      console.log('connected!');
    });
    this.currentProvider$.value.on('disconnect', () => this.onDisconnect());
    this.currentProvider$.value.on('accountsChanged', async (accounts: string[]) => {
      // this.providerUserInfo$.next({
      //   ...this.providerUserInfo$.value,
      //   address: accounts[0],
      //   balance: await this.getUserBalance(accounts[0])
      // });
      window.location.reload();
    });
    this.currentProvider$.value.on('chainChanged', (chainId: number) => {
      console.log(chainId);
      window.location.reload();
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
