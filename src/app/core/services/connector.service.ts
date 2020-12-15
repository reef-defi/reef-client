import { Injectable } from '@angular/core';
import Web3 from 'web3';
import WalletConnectProvider from '@walletconnect/web3-provider';
import WalletLink from 'walletlink';
import Torus from '@toruslabs/torus-embed';
import { getProviderName } from '../utils/provider-name';
import { BehaviorSubject } from 'rxjs';
import { IChainData, IContract, IProviderUserInfo, ITransaction } from '../models/types';
import { getChainData } from '../utils/chains';
import { NotificationService } from './notification.service';
import { contractData } from '../../../assets/abi';
import { addresses, addresses as addrs } from '../../../assets/addresses';
import { MaxUint256 } from '../utils/pools-utils';
const { REEF_TOKEN, REEF_BASKET, REEF_FARMING, REEF_STAKING } = addrs;
const Web3Modal = window.Web3Modal.default;

@Injectable({
  providedIn: 'root'
})
export class ConnectorService {
  basketContract$ = new BehaviorSubject<IContract>(null);
  stakingContract$ = new BehaviorSubject<IContract>(null);
  farmingContract$ = new BehaviorSubject<IContract>(null);
  reefTokenContract$ = new BehaviorSubject<IContract>(null);
  uniswapRouterContract$ = new BehaviorSubject<IContract>(null);
  vaultsContract$ = new BehaviorSubject<IContract>(null);
  currentProvider$ = new BehaviorSubject(null);
  currentProviderName$ = new BehaviorSubject<string | null>(null);
  providerUserInfo$ = new BehaviorSubject<IProviderUserInfo | null>(null);
  transactionsForAccount$ = new BehaviorSubject<ITransaction[]>(null);
  selectedGasPrice$ = new BehaviorSubject(null);
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
    torus: {
      package: Torus,
      options: {
        networkParams: {
          host: 'http://localhost:8600' // TODO: remove this for prod
        }
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
    await this.getUserProviderInfo();
    await this.connectToContract();
    this.subToProviderEvents();
  }

  public async onDisconnect(): Promise<any> {
    this.currentProvider$.next(null);
    this.providerUserInfo$.next(null);
    this.currentProviderName$.next(null);
    if (this.web3.currentProvider.close) {
      await this.web3.currentProvider.close();
    }
    await this.web3Modal.clearCachedProvider();
  }

  public async getTransactionReceipt(txHash: string): Promise<any> {
    return await this.web3.eth.getTransactionReceipt(txHash);
  }

  public toWei(amount: number, unit = 'ether'): string {
    return this.web3.utils.toWei(`${amount}`, unit);
  }

  public fromWei(amount: number | string, unit = 'ether'): Promise<any> {
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
  }

  public async getTransactionsForAddress(address: string, startBlock?: number, endBlock?: number): Promise<void> {
    if (this.transactionsForAccount$.value && this.transactionsForAccount$.value.length > 0) {
      this.transactionsForAccount$.next(this.transactionsForAccount$.value);
      return;
    }
    if (!endBlock) {
      endBlock = await this.web3.eth.getBlockNumber();
    }
    if (!startBlock) {
      startBlock = endBlock - 10;
    }
    const transactions: ITransaction[] = [];
    for (let i = startBlock; i <= endBlock; i++) {
      const block = await this.web3.eth.getBlock(i, true);
      if (block && block.transactions) {
        const txs = block.transactions.filter((tx) =>
          tx.to && (
            tx.to === REEF_BASKET ||
            tx.to === REEF_TOKEN ||
            tx.to === REEF_STAKING ||
            tx.to === REEF_FARMING
          ) && tx.from === address
        ).map((tx) => ({
          ...tx,
          value: this.fromWei(tx.value),
          action: this.getTxAction(tx.to, tx.value),
          timestamp: new Date(block.timestamp),
        }));
        if (txs && txs.length > 0) {
          transactions.push(...txs);
        }
      }
    }
    this.transactionsForAccount$.next(transactions);
  }

  public async getTxByHash(hash: string): Promise<ITransaction | null> {
    const tx = await this.web3.eth.getTransaction(hash);
    if (!tx) {
      return;
    }
    return {
      ...tx,
      value: this.fromWei(tx.value),
      action: this.getTxAction(tx.to, tx.value),
    };
  }

  public createLpContract(tokenSymbol: string): IContract {
    return new this.web3.eth.Contract(contractData.lpToken.abi, addresses[tokenSymbol]);
  }

  public setSelectedGas(type: string, price: number): void {
    this.selectedGasPrice$.next({ type, price });
    localStorage.setItem('reef_gas_price', JSON.stringify({ type, price }));
  }

  public getGasPrice(): number {
    console.log(this.selectedGasPrice$.value.price, 'price')
    const gwei = +this.toWei(Math.round(this.selectedGasPrice$.value.price), 'Gwei');
    console.log(gwei, 'gwei')
    return gwei;
  }

  private async connectToContract(): Promise<void> {
    const basketsC = new this.web3.eth.Contract((contractData.reefBasket.abi as any), contractData.reefBasket.addr);
    const farmingC = new this.web3.eth.Contract((contractData.reefFarming.abi as any), contractData.reefFarming.addr);
    const stakingC = new this.web3.eth.Contract((contractData.reefStaking.abi as any), contractData.reefStaking.addr);
    const tokenC = new this.web3.eth.Contract((contractData.reefToken.abi as any), contractData.reefToken.addr);
    const uniswapC = new this.web3.eth.Contract((contractData.uniswapRouterV2.abi as any), contractData.uniswapRouterV2.addr);
    const vaultsC = new this.web3.eth.Contract((contractData.reefVaults.abi as any), contractData.reefVaults.addr);
    this.basketContract$.next(basketsC);
    this.farmingContract$.next(farmingC);
    this.stakingContract$.next(stakingC);
    this.reefTokenContract$.next(tokenC);
    this.uniswapRouterContract$.next(uniswapC);
    this.vaultsContract$.next(vaultsC);
    const reefBalance = await this.getReefBalance(this.providerUserInfo$.value.address);
    this.providerUserInfo$.next({
      ...this.providerUserInfo$.value,
      reefBalance
    });
    console.log(basketsC, 'BNasket...');
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
  }

  private subToProviderEvents(): void {
    if (!this.currentProvider$.value.on) {
      return;
    }
    this.currentProvider$.value.on('connect', () => {
    });
    this.currentProvider$.value.on('disconnect', () => this.onDisconnect());
    this.currentProvider$.value.on('accountsChanged', async (accounts: string[]) => {
      if (!this.currentProvider$.value.isTorus) {
        window.location.reload();
      }
    });
    this.currentProvider$.value.on('chainChanged', (chainId: number) => {
      window.location.reload();
    });
  }

  private async getUserBalance(address: string): Promise<string> {
    const balance = await this.web3.eth.getBalance(address);
    return await this.web3.utils.fromWei(balance);
  }

  private async getAddress(): Promise<string> {
    const allAccs = await this.web3.eth.getAccounts();
    return allAccs[0];
  }

  private async getChainInfo(): Promise<IChainData> {
    const chainId = await this.web3.eth.getChainId();
    return getChainData(chainId);
  }

  private async getReefBalance(address: string): Promise<string> {
    if (this.reefTokenContract$.value) {
      const balance = await this.reefTokenContract$.value.methods.balanceOf(address).call();
      return await this.web3.utils.fromWei(balance);
    }
  }

  private getTxAction(address: string, value: string): string {
    switch (address) {
      case REEF_TOKEN:
        return 'Transaction';
      case REEF_BASKET:
        return +value > 0 ? 'Investment' : 'Liquidation';
      case REEF_FARMING:
        return 'Farming';
      case REEF_STAKING:
        return 'Staking';
    }
  }


  async approveToken(token: IContract | any, spenderAddr: string): Promise<any> {
    const allowance = await this.getAllowance(token, spenderAddr);
    console.log(allowance, 'allowance');
    if (allowance && +allowance > 0) {
      return true;
    }
    return await token.methods.approve(
      spenderAddr,
      MaxUint256.toString()
    ).send({
      from: this.providerUserInfo$.value.address, // hardcode
    });
  }

  private async getAllowance(token: any, spenderAddr: string): Promise<any> {
    return token.methods.allowance(this.providerUserInfo$.value.address, spenderAddr).call();
  }
}

declare const window;
