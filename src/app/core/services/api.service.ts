import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BehaviorSubject, EMPTY, from, Observable, Subject, Subscription} from 'rxjs';
import {
  IBasketHistoricRoi,
  IGenerateBasketRequest,
  IGenerateBasketResponse,
  IPoolsMetadata,
  QuotePayload,
  Token,
  TokenSymbol,
  Vault,
  VaultAPY
} from '../models/types';
import {subMonths} from 'date-fns';
import {catchError, filter, map, shareReplay, startWith, switchMap, take, tap} from 'rxjs/operators';
import {combineLatest} from 'rxjs/internal/observable/combineLatest';
import {lpTokens} from '../../../assets/addresses';
import {Contract} from 'web3-eth-contract';
import {ConnectorService} from './connector.service';
import {of} from 'rxjs/internal/observable/of';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  })
};

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  public static SUPPORTED_BUY_REEF_TOKENS = [
    {tokenSymbol: TokenSymbol.ETH, src: 'eth.png'},
    {tokenSymbol: TokenSymbol.USDT, src: 'usdt.png'}
  ];

  readonly COMPOSITION_LIMIT = 10;
  public pools$ = new BehaviorSubject(null);
  public tokens$ = new BehaviorSubject(null);
  public vaults$ = new BehaviorSubject(null);
  public gasPrices$ = new BehaviorSubject(null);
  public refreshBalancesForAddress = new Subject<string>();
  public updateTokenBalanceForAddress = new Subject<Token>();
  private url = environment.reefApiUrl;
  private reefPriceUrl = environment.cmcReefPriceUrl;
  private binanceApiUrl = environment.reefBinanceApiUrl;
  private gasPricesUrl = environment.gasPriceUrl;
  private chartsUrl = `https://charts.hedgetrade.com/cmc_ticker`;
  private reefNodeApi = environment.reefNodeApiUrl;
  private balancesByAddr = new Map<string, Observable<any>>();


  constructor(private readonly http: HttpClient, private connectorService: ConnectorService) {
    this.listPools();
    this.listTokens();
    this.getVaults();
  }

  listPools(): Subscription {
    return this.http.get<IPoolsMetadata[]>(`${this.url}/list_pools`).subscribe((pools: IPoolsMetadata[]) => {
      this.pools$.next(pools);
    });
  }

  listTokens(): Subscription {
    return this.http.get<{ [key: string]: string }>(`${this.url}/list_tokens`).subscribe((tokens: { [key: string]: string }) => {
      this.tokens$.next(tokens);
    });
  }

  getGasPrices(): Observable<any> {
    return this.http.get(`${this.gasPricesUrl}`);
  }

  generateBasket(payload: IGenerateBasketRequest): Observable<IGenerateBasketResponse> {
    if (!payload.amount || !payload.risk_level) {
      return EMPTY;
    }
    return this.http.post<IGenerateBasketResponse>(`${this.url}/generate_basket`, payload, httpOptions);
  }

  getHistoricRoi(payload: IGenerateBasketResponse, subtractMonths: number = 1): Observable<IBasketHistoricRoi> {
    const date = new Date();
    const startDate = subMonths(date, subtractMonths);
    const body = {
      start_date: startDate,
      basket: payload,
    };
    return this.http.post<any>(`${this.url}/basket_historic_roi`, body, httpOptions).pipe(
      catchError((err) => EMPTY)
    );
  }

  getCMCReefPrice(): Observable<any> {
    return this.http.get<any>(this.reefPriceUrl).pipe(
      map(res => res.data.market_pairs[0].quote.USD.price)
    );
  }

  getVaults(): Subscription {
    return combineLatest(this.getAllVaults(), this.getVaultsAPY()).pipe(
      map(([vaults, apyVaults]: [Vault, VaultAPY]) => {
        return Object.keys(apyVaults)
          .map((key) => ({
            [key]: {
              ...apyVaults[key],
              APY: +((apyVaults[key].APY - 1) * 100).toFixed(2),
              address: vaults[key] || '',
            }
          }))
          .sort((a, b) => Object.values(b)[0].APY - Object.values(a)[0].APY)
          .reduce((memo, curr) => ({...memo, ...curr}));
      }),
      catchError((err) => EMPTY)
    ).subscribe(vaults => this.vaults$.next(vaults));
  }

  getAllVaults(): Observable<Vault> {
    return this.http.get<Vault>(`${this.url}/list_vaults`).pipe(
      catchError((err) => EMPTY)
    );
  }

  getVaultsAPY(): Observable<VaultAPY> {
    return this.http.get<VaultAPY>(`${this.url}/vault_estimate_apy`).pipe(
      catchError((err) => EMPTY)
    );
  }

  registerBinanceUser(email: string, address: string): Observable<any> {
    return this.http.post(`${this.binanceApiUrl}/register`, {email, address}).pipe(
      take(1),
    );
  }

  bindBinanceUser(email: string): Observable<any> {
    return this.http.post(`${this.binanceApiUrl}/redirect`, {email}).pipe(
      take(1),
    );
  }

  getBindingStatus(address: string): Observable<any> {
    return this.http.post(`${this.binanceApiUrl}/bindingStatus`, {address}).pipe(
      take(1),
    );
  }

  getBinanceQuote(params: QuotePayload): Observable<any> {
    const {cryptoCurrency, baseCurrency, requestedAmount, address, email} = params;
    return this.http.post(`${this.binanceApiUrl}/getQuote`, {
      cryptoCurrency, baseCurrency, requestedAmount, address, email
    }).pipe(
      take(1),
    );
  }

  executeTrade(address: string, quoteId: string, orderId?: string): Observable<any> {
    return this.http.post(`${this.binanceApiUrl}/execute`, {address, quoteId, orderId}).pipe(
      take(1),
    );
  }

  getBinanceTransactions(address: string): Observable<any> {
    return this.http.post(`${this.binanceApiUrl}/transactions`, {address}).pipe(
      take(1),
    );
  }

  createUserAfterBind(email: string, address: string, userId: string): Observable<any> {
    return this.http.post(`${this.binanceApiUrl}/create-user`, {email, address, userId}).pipe(
      take(1),
    );
  }

  checkIfUserRegistered(address: string): Observable<any> {
    return this.http.post(`${this.binanceApiUrl}/registrationStatus`, {address}).pipe(
      take(1),
    );
  }

  getReefEthPrice(): Observable<{ [key: string]: { [key: string]: number } }> {
    return this.http.get<{ [key: string]: { [key: string]: number } }>(`${this.chartsUrl}/BTC,ETH?quote=USD`).pipe(
      catchError(err => EMPTY)
    );
  }

  /**
   * COVALENT
   */

  getTokenBalances$(address: string): Observable<Token[]> {
    if (!address) {
      console.warn('getTokenBalances NO PARAMS');
      return null;
    }
    if (!this.balancesByAddr.has(address)) {
      const requestedAddressBalances$ = this.refreshBalancesForAddress.pipe(
        startWith(address),
        filter(addr => addr === address),
        switchMap(addr => this.http.get<any>(`${this.reefNodeApi}/covalent/${addr}/balances`)),
        tap((v: any[]) => v.forEach(itm => itm.address = address)),
        map(tokens => tokens.map(this.removeTokenPlaceholders.bind(this))),
        catchError(err => {
          throw new Error(err);
        }),
        shareReplay(1)
      );
      const localUpdatedAddrBalance$: Observable<{ token: Token, isIncludedInBalances: boolean; }> = this.updateTokenBalanceForAddress.pipe(
        map(t => ({token: t, isIncludedInBalances: false})),
        startWith(null),
        shareReplay(1)
      );

      const finalBalances$ = combineLatest([requestedAddressBalances$, localUpdatedAddrBalance$]).pipe(
        map(([requestedBalances, localUpdate]: [Token[], { token: Token, isIncludedInBalances: boolean }]) => {
          if (!!localUpdate && !localUpdate.isIncludedInBalances && this.balancesForAddress(requestedBalances, localUpdate.token.address)) {
            const requestedTokenBalance = this.findTokenBalances(
              requestedBalances, TokenSymbol[localUpdate.token.contract_ticker_symbol])[0];
            if (!!requestedTokenBalance && requestedTokenBalance.address === localUpdate.token.address) {
              requestedTokenBalance.balance = localUpdate.token.balance;
              localUpdate.isIncludedInBalances = true;
            }
          }
          return requestedBalances;
        }),
        switchMap(tokens => this.addCovalentMissingTokens(address, tokens)),
        shareReplay(1)
      );
      this.balancesByAddr.set(address, finalBalances$);
    }
    return this.balancesByAddr.get(address);
  }

  private balancesForAddress(requested: Token[], address: string): boolean {
    return requested.length && requested[0].address === address;
  }

// TODO return only one value
  getTokenBalance$(addr: string, tokenSymbol: TokenSymbol): Observable<Token[]> {
    return this.getTokenBalances$(addr).pipe(
      map((balances: Token[]) => {
        const tokenBalances = this.findTokenBalances(balances, tokenSymbol);
        return tokenBalances && tokenBalances.length ? tokenBalances : [{
          balance: 0,
          contract_ticker_symbol: tokenSymbol,
          address: addr
        } as Token];
      }),
      shareReplay(1)
    );
  }

  private findTokenBalances(balances: Token[], tokenSymbol: TokenSymbol): Token[] {
    return balances.filter(tkn => {
      if (TokenSymbol[tkn.contract_ticker_symbol] === tokenSymbol) {
        return true;
      }
      return false;
    });
  }

  setTokenBalance$(addr: string, tokenSymbol: TokenSymbol, balance: number): Observable<Token[]> {
    return this.getTokenBalances$(addr).pipe(
      map((balances: Token[]) => {
        const tokenBalances = balances.filter((b: Token) => {
          if (TokenSymbol[b.contract_ticker_symbol] === tokenSymbol) {
            return true;
          }
          return false;
        });
        return tokenBalances && tokenBalances.length ? tokenBalances : [{
          balance: 0,
          contract_ticker_symbol: tokenSymbol,
          address: addr
        } as Token];
      }),
      shareReplay(1)
    );
  }

  getTransactions(address: string): any {
    return this.http.get<any>(`${this.reefNodeApi}/covalent/${address}/transactions`);
  }

  getReefPricing(fromAddr: string, to: string): any {
    return this.http.get<any>(`${this.reefNodeApi}/covalent/reef-pricing?from=${fromAddr}&to=${to}`);
  }

  getPortfolio(address: string): Observable<any> {
    return this.http.get<any>(`${this.reefNodeApi}/dashboard/${address}`);
  }

  private removeTokenPlaceholders(token: any): Token {
    if (token.contract_ticker_symbol === 'UNI-V2') {
      token.contract_ticker_symbol = lpTokens[token.contract_address] || 'Uniswap LP Token';
      token.logo_url = 'https://logos.covalenthq.com/tokens/0x1f9840a85d5af5bf1d1762f925bdaddc4201f984.png';
    }
    return token;
  }

  private async getErc20BalanceOnChain(address: string, contract: Contract): Promise<string> {
    if (!contract) {
      throw new Error('No ERC20 contract' + contract);
    }
    const web3 = await this.connectorService.web3$.pipe(take(1)).toPromise();
    const balance = await contract.methods.balanceOf(address).call();
    return await web3.utils.fromWei(balance);
  }

  private addCovalentMissingTokens(address: string, tokens: Token[]): Observable<Token[]> {
    const missingBalanceTokens = ApiService.SUPPORTED_BUY_REEF_TOKENS
    // .filter(supported => !tokens.some(tkn => supported.tokenSymbol === tkn.contract_ticker_symbol));
    missingBalanceTokens.push(
      {tokenSymbol: TokenSymbol.REEF_TOKEN, src: 'reef.png'})
    console.log('Missing tokens=', missingBalanceTokens)
    if (!missingBalanceTokens.length) {
      return of(tokens);
    }

    const missingBalances$ = this.connectorService.providerUserInfo$.pipe(
      switchMap(info => {
        return combineLatest(missingBalanceTokens.map((supportedConfig) => {
          let balance$: Observable<any>;
          const tokenAddress = info.availableSmartContractAddresses[supportedConfig.tokenSymbol];
          if (supportedConfig.tokenSymbol === TokenSymbol.ETH) {
            balance$ = this.connectorService.web3$.pipe(
              take(1),
              switchMap((web3) => web3.eth.getBalance(address).then(b => web3.utils.fromWei(b))),
            );
          } else {
            const contract = this.connectorService.createErc20TokenContract(
              supportedConfig.tokenSymbol, info.availableSmartContractAddresses);
            balance$ = from(this.getErc20BalanceOnChain(address, contract));
          }

          return balance$.pipe(
            tap(v => console.log('VVVVV', v, supportedConfig.tokenSymbol)),
            map(balance => ({
                contract_ticker_symbol: supportedConfig.tokenSymbol,
                balance: +balance,
                address: address,
                contract_address: tokenAddress
              } as Token)
            ));
        }));
      })
    );
    return missingBalances$.pipe(
      map((mBalances: Token[]) => tokens.concat(mBalances))
    );
  }
}
