import {Injectable} from '@angular/core';
import Web3 from 'web3';
import {Contract} from 'web3-eth-contract';
import WalletConnectProvider from '@walletconnect/web3-provider';
import WalletLink from 'walletlink';
import Torus from '@toruslabs/torus-embed';
import {getProviderName} from '../utils/provider-name';
import {BehaviorSubject, ReplaySubject} from 'rxjs';
import {
  ChainId,
  IChainData,
  IPendingTransactions,
  IProviderUserInfo,
  ITransaction,
  ProtocolAddresses,
  ProviderName,
  TokenSymbol,
} from '../models/types';
import {getChainData} from '../utils/chains';
import {NotificationService} from './notification.service';
import {getContractData} from '../../../assets/abi';
import {take} from 'rxjs/operators';
import {AddressUtils} from '../../shared/utils/address.utils';
import {ProviderUtil} from '../../shared/utils/provider.util';
import {first} from 'rxjs/internal/operators/first';

const Web3Modal = window.Web3Modal.default;

@Injectable({
  providedIn: 'root',
})
export class ConnectorService {
  basketContract$ = new BehaviorSubject<Contract>(null);
  stakingContract$ = new BehaviorSubject<Contract>(null);
  farmingContract$ = new BehaviorSubject<Contract>(null);
  reefTokenContract$ = new BehaviorSubject<Contract>(null);
  uniswapRouterContract$ = new BehaviorSubject<Contract>(null);
  vaultsContract$ = new BehaviorSubject<Contract>(null);
  currentProvider$ = new BehaviorSubject(null);
  currentProviderName$ = new BehaviorSubject<string | null>(null);
  providerUserInfo$ = new ReplaySubject<IProviderUserInfo | null>(1);
  transactionsForAccount$ = new BehaviorSubject<ITransaction[]>(null);
  selectedGasPrice$ = new BehaviorSubject(null);

  pendingTransactions$ = new BehaviorSubject<IPendingTransactions>({
    transactions: [],
  });

  walletLink = new WalletLink({
    appName: 'reef.finance',
  });
  // TODO figure if when MetaMask network is different it connects to that network or url has to be static
  WalletLinkProvider = this.walletLink.makeWeb3Provider(
    ProviderUtil.getProviderUrl(ProviderName.INFURA),
    ProviderUtil.getProviderChainId(ProviderName.INFURA)
  );
  providerLoading$ = new BehaviorSubject(false);
  providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        rpc: {
          1: ProviderUtil.getProviderUrl(ProviderName.INFURA),
          56: 'https://bsc-dataseed.binance.org/',
          '0x38': 'https://bsc-dataseed.binance.org/',
        },
      },
    },
    torus: {
      package: Torus,
    },
    'custom-walletlink': {
      display: {
        logo: '/assets/images/wallet_link.png',
        name: 'Wallet Link',
        description: 'Scan with WalletLink to connect',
      },
      package: this.WalletLinkProvider,
      connector: async (provider, options) => {
        await provider.enable();
        return provider;
      },
    },
  };
  public web3Modal = null;
  private web3 = null;
  // TODO remove web3 private property and also use web3$ locally
  public web3$ = new ReplaySubject<any>();

  // public web3WS = null;

  constructor(private readonly notificationService: NotificationService) {
    // this.providerUserInfo$.subscribe();
    this.web3Modal = new Web3Modal({
      providerOptions: this.providerOptions,
      cacheProvider: true,
      disableInjectedProvider: false,
    });
    if (this.web3Modal.cachedProvider) {
      this.onConnect();
    }
    this.web3Modal.on('close', () => {
      this.providerLoading$.next(false);
    });
    this.web3Modal.on('error', () => {
      this.providerLoading$.next(false);
    });
  }

  public async onConnect(): Promise<any> {
    this.providerLoading$.next(true);
    const provider = await this.web3Modal.connect();
    const web3 = this.initWeb3(provider);
    console.log(window.ethereum.chainId, 'CHAINID');
    this.currentProvider$.next(provider);
    this.currentProviderName$.next(getProviderName(web3, provider));
    this.notificationService.showNotification(
      `${this.currentProviderName$.value} wallet connected.`,
      'Okay!',
      'success'
    );
    this.providerLoading$.next(false);
    // TODO remove private web3 - use web3$
    this.web3 = web3;
    this.web3$.next(this.web3);
    const info: IProviderUserInfo = await this.createUserProviderInfo(web3);
    await this.connectToContract(info, web3);
    this.subToProviderEvents();
    this.providerUserInfo$.next(info);
  }

  public async onDisconnect(): Promise<any> {
    const web3 = await this.getWeb3();
    this.currentProvider$.next(null);
    this.providerUserInfo$.next(null);
    this.currentProviderName$.next(null);
    if (web3.currentProvider.close) {
      await web3.currentProvider.close();
    }
    await this.web3Modal.clearCachedProvider();
  }

  public async getTransactionReceipt(txHash: string): Promise<any> {
    const web3 = await this.getWeb3();
    return await web3.eth.getTransactionReceipt(txHash);
  }

  public toWei(amount: number, unit = 'ether'): string {
    return this.web3.utils.toWei(`${amount}`, unit);
  }

  public fromWei(amount: number | string, unit = 'ether'): Promise<any> {
    return this.web3.utils.fromWei(`${amount}`, unit);
  }

  private async createUserProviderInfo(web3: Web3): Promise<IProviderUserInfo> {
    const address = await this.getAddress(web3);
    const chainInfo = await this.getChainInfo(web3);
    const availableSmartContractAddresses = AddressUtils.getChainAddresses(
      chainInfo
    );
    if (!availableSmartContractAddresses) {
      throw new Error(
        'Could not get contract addresses for chain_id=' + chainInfo.chain_id
      );
    }
    return Promise.resolve({
      address,
      chainInfo,
      availableSmartContractAddresses,
    } as IProviderUserInfo);
  }

  public async getTransactionsForAddress(
    address: string,
    startBlock?: number,
    endBlock?: number
  ): Promise<void> {
    const web3 = await this.getWeb3();
    if (
      this.transactionsForAccount$.value &&
      this.transactionsForAccount$.value.length > 0
    ) {
      this.transactionsForAccount$.next(this.transactionsForAccount$.value);
      return;
    }
    if (!endBlock) {
      endBlock = await web3.eth.getBlockNumber();
    }
    if (!startBlock) {
      startBlock = endBlock - 10;
    }
    const info: IProviderUserInfo = await this.providerUserInfo$
      .pipe(take(1))
      .toPromise();
    const transactions: ITransaction[] = [];
    for (let i = startBlock; i <= endBlock; i++) {
      const block = await web3.eth.getBlock(i, true);
      if (block && block.transactions) {
        const txs = block.transactions
          .filter(
            (tx) =>
              tx.to &&
              (tx.to === info.availableSmartContractAddresses.REEF_BASKET ||
                tx.to === info.availableSmartContractAddresses.REEF ||
                tx.to === info.availableSmartContractAddresses.REEF_STAKING ||
                tx.to === info.availableSmartContractAddresses.REEF_FARMING) &&
              tx.from === address
          )
          .map((tx) => ({
            ...tx,
            value: this.fromWei(tx.value),
            action: this.getTxAction(tx.to, tx.value, info),
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
    const web3 = await this.getWeb3();
    const info: IProviderUserInfo = await this.providerUserInfo$
      .pipe(take(1))
      .toPromise();
    const tx = await web3.eth.getTransaction(hash);
    if (!tx) {
      return;
    }
    return {
      ...tx,
      value: this.fromWei(tx.value),
      action: this.getTxAction(tx.to, tx.value, info),
    };
  }

  public createErc20TokenContract(
    tokenSymbol: TokenSymbol,
    addresses: ProtocolAddresses
  ): Contract {
    const tokenSymbolContractAddress = AddressUtils.getTokenSymbolContractAddress(
      addresses,
      tokenSymbol
    );
    if (!tokenSymbolContractAddress) {
      return null;
    }
    const contractData = getContractData(addresses);
    return new this.web3.eth.Contract(
      contractData.erc20Token.abi,
      tokenSymbolContractAddress
    );
  }

  public createErc20TokenContractFromAddress(
    contractAddress: string
  ): Contract {
    if (!contractAddress) {
      throw new Error('No address provided');
    }
    const contractData = getContractData({} as ProtocolAddresses);
    return new this.web3.eth.Contract(
      contractData.erc20Token.abi,
      contractAddress
    );
  }

  public setSelectedGas(type: string, price: number): void {
    this.selectedGasPrice$.next({type, price});
    localStorage.setItem('reef_gas_price', JSON.stringify({type, price}));
  }

  public getGasPrice(chainId = ChainId.MAINNET): string {
    if (chainId === ChainId.BINANCE_SMART_CHAIN) {
      return this.toWei(20, 'Gwei');
    }
    const gwei = this.toWei(
      Math.round(this.selectedGasPrice$.value.price),
      'Gwei'
    );
    return gwei;
  }

  public async getWeb3(): Promise<any> {
    return await this.web3$.pipe(first()).toPromise();
  }

  /*public toTokenSymbol(info: IProviderUserInfo, tokenContractAddress): TokenSymbol {
    const tokenSymbolStr = Object.keys(info.availableSmartContractAddresses)
      .find(ts => tokenContractAddress.toLowerCase() === info.availableSmartContractAddresses[ts].toLowerCase());
    if(!TokenSymbol[tokenSymbolStr]){
      console.log('ERROR resolving address to token symbol =', tokenContractAddress)
    }
    return TokenSymbol[tokenSymbolStr];
  }*/

  private async connectToContract(
    info: IProviderUserInfo,
    web3: Web3
  ): Promise<void> {
    const addresses = info.availableSmartContractAddresses;
    const contractData = getContractData(addresses);
    const basketsC = new web3.eth.Contract(
      contractData.reefBasket.abi as any,
      contractData.reefBasket.addr
    );
    const farmingC = new web3.eth.Contract(
      contractData.reefFarming.abi as any,
      contractData.reefFarming.addr
    );
    const stakingC = new web3.eth.Contract(
      contractData.reefStaking.abi as any,
      contractData.reefStaking.addr
    );
    const tokenC = new web3.eth.Contract(
      contractData.reefToken.abi as any,
      contractData.reefToken.addr
    );
    const uniswapC = new web3.eth.Contract(
      contractData.uniswapRouterV2.abi as any,
      contractData.uniswapRouterV2.addr
    );
    const vaultsC = new web3.eth.Contract(
      contractData.reefVaults.abi as any,
      contractData.reefVaults.addr
    );
    // TODO why is this as a subject - could be cached locally and have a method getContract(contractIdent)
    this.basketContract$.next(basketsC);
    this.farmingContract$.next(farmingC);
    this.stakingContract$.next(stakingC);
    this.reefTokenContract$.next(tokenC);
    this.uniswapRouterContract$.next(uniswapC);
    this.vaultsContract$.next(vaultsC);
    return Promise.resolve();
  }

  /*private async initWeb3Modal(): Promise<any> {
    this.web3Modal = new Web3Modal({
      providerOptions: this.providerOptions,
      cacheProvider: true,
      disableInjectedProvider: false
    });
    await this.onConnect();
  }*/

  private initWeb3(provider: any): any {
    const w3 = new Web3(provider);
    window.send = (e, t) => {
      return provider.send(e, t);
    };
    // this.web3WS = new Web3('wss://mainnet.infura.io/ws/v3/eadc555e1ec7423f94e94d8a06a2f310');
    w3.eth.extend({
      methods: [
        {
          name: 'chainId',
          call: 'eth_chainId',
          // @ts-ignore
          outputFormatter: w3.utils.hexToNumber,
        },
      ],
    });
    return w3;
  }

  private subToProviderEvents(): void {
    if (!this.currentProvider$.value.on) {
      return;
    }
    this.currentProvider$.value.on('connect', () => {
    });
    this.currentProvider$.value.on('disconnect', () => this.onDisconnect());
    this.currentProvider$.value.on(
      'accountsChanged',
      async (accounts: string[]) => {
        if (!this.currentProvider$.value.isTorus) {
          window.location.reload();
        }
      }
    );
    this.currentProvider$.value.on('chainChanged', (chainId: number) => {
      window.location.reload();
    });
    // const subscription = this.web3WS.eth.subscribe('pendingTransactions').on('data', (tx) => { console.log(tx, 'from sub')})
  }

  private async getUserBalance(address: string): Promise<string> {
    const web3 = await this.getWeb3();
    const balance = await web3.eth.getBalance(address);
    return await web3.utils.fromWei(balance);
  }

  private async getAddress(web3: Web3): Promise<string> {
    const allAccs = await web3.eth.getAccounts();
    return allAccs[0];
  }

  private async getChainInfo(web3: Web3): Promise<IChainData> {
    let chainId: number;
    let chIdWindow;
    let chIdW3;
    if (!!window.ethereum && !!window.ethereum.chainId) {
      chIdWindow = window.ethereum.chainId.toString();
      chainId = parseInt(chIdWindow, 10);
      if (isNaN(chainId) && chIdWindow.startsWith('0x')) {
        chainId = parseInt(chIdWindow, 16);
      }
    }
    if (!chainId || isNaN(chainId)) {
      chIdW3 = await web3.eth.getChainId();
      chainId = parseInt(chIdW3, 10);
    }
    if (!chainId || isNaN(chainId)) {
      let message = `Chain id ${chIdWindow}/${chIdW3}/${chainId} unknown.`;
      alert(message);
      throw new Error(message);
    }
    return getChainData(chainId);
  }

  private async getTxAction(
    address: string,
    value: string,
    providerInfo: IProviderUserInfo
  ): Promise<string> {
    switch (address) {
      case providerInfo.availableSmartContractAddresses.REEF:
        return Promise.resolve('Transaction');
      case providerInfo.availableSmartContractAddresses.REEF_BASKET:
        return Promise.resolve(+value > 0 ? 'Investment' : 'Liquidation');
      case providerInfo.availableSmartContractAddresses.REEF_FARMING:
        return Promise.resolve('Farming');
      case providerInfo.availableSmartContractAddresses.REEF_STAKING:
        return Promise.resolve('Staking');
    }
  }
}

declare const window;
