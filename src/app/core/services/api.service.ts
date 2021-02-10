import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  BehaviorSubject,
  EMPTY,
  Observable,
  Subject,
  Subscription,
} from 'rxjs';
import {
  ChainId,
  IBasketHistoricRoi,
  IGenerateBasketRequest,
  IGenerateBasketResponse,
  IPoolsMetadata,
  IProviderUserInfo,
  QuotePayload,
  Token,
  TokenSymbol,
  Vault,
  VaultAPY,
} from '../models/types';
import { subMonths } from 'date-fns';
import {
  catchError,
  filter,
  map,
  mergeMap,
  shareReplay,
  startWith,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';
import { combineLatest } from 'rxjs/internal/observable/combineLatest';
import { AddressUtils } from '../../shared/utils/address.utils';
import { ConnectorService } from './connector.service';
import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import { of } from 'rxjs/internal/observable/of';
import { TokenUtil } from '../../shared/utils/token.util';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  public static SUPPORTED_BUY_REEF_TOKENS = [
    { tokenSymbol: TokenSymbol.ETH, src: 'eth.png' },
    { tokenSymbol: TokenSymbol.USDT, src: 'usdt.png' },
  ];

  public static REEF_PROTOCOL_TOKENS = [
    ...ApiService.SUPPORTED_BUY_REEF_TOKENS,
    { tokenSymbol: TokenSymbol.REEF, src: 'reef.png' },
    { tokenSymbol: TokenSymbol.REEF_WETH_POOL, src: 'reef_weth.png' },
    { tokenSymbol: TokenSymbol.REEF_USDT_POOL, src: 'reef_usdt.png' },
  ];

  private static COVALENT_SUPPORTED_NETWORK_IDS = [
    ChainId.MAINNET,
    ChainId.MATIC,
  ];

  readonly COMPOSITION_LIMIT = 10;
  public pools$ = new BehaviorSubject(null);
  public tokens$ = new BehaviorSubject(null);
  public vaults$ = new BehaviorSubject(null);
  public gasPrices$ = new BehaviorSubject(null);
  public refreshBalancesForAddress = new Subject<string>();
  public updateTokensInBalances = new Subject<TokenSymbol[]>();
  private url = environment.reefApiUrl;
  private reefPriceUrl = environment.cmcReefPriceUrl;
  private binanceApiUrl = environment.reefBinanceApiUrl;
  private gasPricesUrl = environment.gasPriceUrl;
  private chartsUrl = `https://charts.hedgetrade.com/cmc_ticker`;
  private reefNodeApi = environment.reefNodeApiUrl;
  private balancesByAddr = new Map<string, Observable<any>>();

  constructor(
    private readonly http: HttpClient,
    private connectorService: ConnectorService
  ) {
    this.listPools();
    this.listTokens();
    this.getVaults();
  }

  listPools(): Subscription {
    return this.http
      .get<IPoolsMetadata[]>(`${this.url}/list_pools`)
      .subscribe((pools: IPoolsMetadata[]) => {
        this.pools$.next(pools);
      });
  }

  listTokens(): Subscription {
    return this.http
      .get<{ [key: string]: string }>(`${this.url}/list_tokens`)
      .subscribe((tokens: { [key: string]: string }) => {
        this.tokens$.next(tokens);
      });
  }

  getGasPrices(): Observable<any> {
    return this.http.get(`${this.gasPricesUrl}`);
  }

  generateBasket(
    payload: IGenerateBasketRequest
  ): Observable<IGenerateBasketResponse> {
    if (!payload.amount || !payload.risk_level) {
      return EMPTY;
    }
    return this.http.post<IGenerateBasketResponse>(
      `${this.url}/generate_basket`,
      payload,
      httpOptions
    );
  }

  getHistoricRoi(
    payload: IGenerateBasketResponse,
    subtractMonths: number = 1
  ): Observable<IBasketHistoricRoi> {
    const date = new Date();
    const startDate = subMonths(date, subtractMonths);
    const body = {
      start_date: startDate,
      basket: payload,
    };
    return this.http
      .post<any>(`${this.url}/basket_historic_roi`, body, httpOptions)
      .pipe(catchError((err) => EMPTY));
  }

  getCMCReefPrice(): Observable<any> {
    return this.http
      .get<any>(this.reefPriceUrl)
      .pipe(map((res) => res.data.market_pairs[0].quote.USD.price));
  }

  getVaults(): Subscription {
    return combineLatest(this.getAllVaults(), this.getVaultsAPY())
      .pipe(
        map(([vaults, apyVaults]: [Vault, VaultAPY]) => {
          return Object.keys(apyVaults)
            .map((key) => ({
              [key]: {
                ...apyVaults[key],
                APY: +((apyVaults[key].APY - 1) * 100).toFixed(2),
                address: vaults[key] || '',
              },
            }))
            .sort((a, b) => Object.values(b)[0].APY - Object.values(a)[0].APY)
            .reduce((memo, curr) => ({ ...memo, ...curr }));
        }),
        catchError((err) => EMPTY)
      )
      .subscribe((vaults) => this.vaults$.next(vaults));
  }

  getAllVaults(): Observable<Vault> {
    return this.http
      .get<Vault>(`${this.url}/list_vaults`)
      .pipe(catchError((err) => EMPTY));
  }

  getVaultsAPY(): Observable<VaultAPY> {
    return this.http
      .get<VaultAPY>(`${this.url}/vault_estimate_apy`)
      .pipe(catchError((err) => EMPTY));
  }

  registerBinanceUser(email: string, address: string): Observable<any> {
    return this.http
      .post(`${this.binanceApiUrl}/register`, { email, address })
      .pipe(take(1));
  }

  bindBinanceUser(email: string): Observable<any> {
    return this.http
      .post(`${this.binanceApiUrl}/redirect`, { email })
      .pipe(take(1));
  }

  getBindingStatus(address: string): Observable<any> {
    return this.http
      .post(`${this.binanceApiUrl}/bindingStatus`, { address })
      .pipe(take(1));
  }

  getBinanceQuote(params: QuotePayload): Observable<any> {
    const {
      cryptoCurrency,
      baseCurrency,
      requestedAmount,
      address,
      email,
    } = params;
    return this.http
      .post(`${this.binanceApiUrl}/getQuote`, {
        cryptoCurrency,
        baseCurrency,
        requestedAmount,
        address,
        email,
      })
      .pipe(take(1));
  }

  executeTrade(
    address: string,
    quoteId: string,
    orderId?: string
  ): Observable<any> {
    return this.http
      .post(`${this.binanceApiUrl}/execute`, {
        address,
        quoteId,
        orderId,
      })
      .pipe(take(1));
  }

  getBinanceTransactions(address: string): Observable<any> {
    return this.http
      .post(`${this.binanceApiUrl}/transactions`, { address })
      .pipe(take(1));
  }

  createUserAfterBind(
    email: string,
    address: string,
    userId: string
  ): Observable<any> {
    return this.http
      .post(`${this.binanceApiUrl}/create-user`, {
        email,
        address,
        userId,
      })
      .pipe(take(1));
  }

  checkIfUserRegistered(address: string): Observable<any> {
    return this.http
      .post(`${this.binanceApiUrl}/registrationStatus`, { address })
      .pipe(take(1));
  }

  getReefEthPrice(): Observable<{
    [key: string]: { [key: string]: number };
  }> {
    return this.http
      .get<{ [key: string]: { [key: string]: number } }>(
        `${this.chartsUrl}/BTC,ETH?quote=USD`
      )
      .pipe(catchError((err) => EMPTY));
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
      const refreshForAddr$ = this.refreshBalancesForAddress.pipe(
        startWith(address),
        filter((addr) => addr === address)
      );
      const requestedAddressBalances$ = combineLatest([
        refreshForAddr$,
        this.connectorService.providerUserInfo$,
      ]).pipe(
        switchMap(([addr, info]: [string, IProviderUserInfo]) =>
          this.getAddressTokenBalances$(addr, info)
        ),
        catchError((err) => {
          throw new Error(err);
        }),
        shareReplay(1)
      );
      const updateBalanceFor$: Observable<{
        tokenSymbols: TokenSymbol[];
        isIncludedInBalances: boolean;
      }> = this.updateTokensInBalances.pipe(
        map((t) => ({ tokenSymbols: t, isIncludedInBalances: false })),
        startWith(null),
        shareReplay(1)
      );

      const finalBalances$ = combineLatest([
        requestedAddressBalances$,
        updateBalanceFor$,
      ]).pipe(
        mergeMap(
          ([cachedBalances, localUpdate]: [
            Token[],
            {
              tokenSymbols: TokenSymbol[];
              isIncludedInBalances: boolean;
            }
          ]) => {
            if (
              !!localUpdate &&
              !!localUpdate.tokenSymbols.length &&
              !localUpdate.isIncludedInBalances
            ) {
              localUpdate.isIncludedInBalances = true;
              const tokenBalances$ = localUpdate.tokenSymbols.map((ts) =>
                this.getBalanceOnChain$(address, ts)
              );
              return combineLatest(tokenBalances$).pipe(
                map((balancesResult: string[]) => {
                  return localUpdate.tokenSymbols.map(
                    (tSymbol: TokenSymbol, sIndex: number) => {
                      return {
                        tokenSymbol: tSymbol,
                        balance: balancesResult[sIndex],
                      };
                    }
                  );
                }),
                map(
                  (
                    updatedTokenResult: {
                      tokenSymbol: TokenSymbol;
                      balance: string;
                    }[]
                  ) => {
                    return cachedBalances.map((tb: Token) => {
                      const updated = updatedTokenResult.find(
                        (upd) => upd.tokenSymbol === tb.contract_ticker_symbol
                      );
                      if (updated) {
                        tb.balance = new BigNumber(
                          updated.balance,
                          10
                        ).toNumber();
                      }
                      return tb;
                    });
                  }
                )
              );
            }
            return of(cachedBalances);
          }
        ),
        tap((v) => console.log('balances=', v)),
        shareReplay(1)
      );
      this.balancesByAddr.set(address, finalBalances$);
    }
    return this.balancesByAddr.get(address);
  }

  private getAddressTokenBalances$(
    address: string,
    info: IProviderUserInfo
  ): Observable<Token[]> {
    const chainId: ChainId = info.chainInfo.chain_id;
    let balances$: Observable<Token[]>;
    if (ApiService.COVALENT_SUPPORTED_NETWORK_IDS.indexOf(chainId) > -1) {
      balances$ = this.http
        .get<any>(`${this.reefNodeApi}/covalent/${address}/balances`)
        .pipe(tap((v: any[]) => v.forEach((itm) => (itm.address = address))));
    } else {
      balances$ = this.getReefProtocolBalancesFromChain$(info, address);
    }

    return balances$.pipe(
      map((tokens) =>
        tokens.map((token) => this.removeTokenPlaceholders(info, token))
      )
    );
  }

  private balancesForAddress(requested: Token[], address: string): boolean {
    return requested.length && requested[0].address === address;
  }

  getTokenBalance$(
    addr: string,
    tokenSymbol?: TokenSymbol,
    tokenAddress?: string
  ): Observable<Token> {
    if (!tokenSymbol && !tokenAddress) {
      throw new Error('Token symbol or address is required.');
    }
    return this.getTokenBalances$(addr).pipe(
      switchMap((balances: Token[]) => {
        const tokenBalance = tokenSymbol
          ? this.findTokenBalance(balances, tokenSymbol)
          : null;
        if (tokenBalance) {
          return of(tokenBalance);
        }
        return this.getBalanceOnChain$(addr, tokenSymbol, tokenAddress).pipe(
          map(
            (v) =>
              ({
                balance: parseFloat(v),
                contract_ticker_symbol: tokenSymbol,
                address: addr,
              } as Token)
          )
        );
      }),
      shareReplay(1)
    );
  }

  private findTokenBalance(balances: Token[], tokenSymbol: TokenSymbol): Token {
    return balances.find((tkn) => {
      if (TokenSymbol[tkn.contract_ticker_symbol] === tokenSymbol) {
        return true;
      }
      return false;
    });
  }

  getTransactions(address: string): any {
    return this.http.get<any>(
      `${this.reefNodeApi}/covalent/${address}/transactions`
    );
  }

  getReefPricing(fromAddr: string, to: string): any {
    return this.http.get<any>(
      `${this.reefNodeApi}/covalent/reef-pricing?from=${fromAddr}&to=${to}`
    );
  }

  getPortfolio(address: string): Observable<any> {
    return this.http.get<any>(`${this.reefNodeApi}/dashboard/${address}`);
  }

  checkIfAuth(code: string): Observable<any> {
    return this.http.post<{ [key: string]: boolean }>(
      `${this.reefNodeApi}/in`,
      { code }
    );
  }

  private removeTokenPlaceholders(info: IProviderUserInfo, token: any): Token {
    if (token.contract_ticker_symbol === 'UNI-V2') {
      const addressLabel = AddressUtils.getAddressLabel(
        info,
        token.contract_address
      );
      token.contract_ticker_symbol = addressLabel || 'Uniswap LP Token';
      token.logo_url =
        'https://logos.covalenthq.com/tokens/0x1f9840a85d5af5bf1d1762f925bdaddc4201f984.png';
    }
    return token;
  }

  private getBalanceOnChain$(
    address: string,
    tokenSymbol?: TokenSymbol,
    tokenAddress?: string
  ): Observable<string> {
    if (!tokenSymbol && !tokenAddress) {
      throw new Error('Token symbol or address is required.');
    }
    return combineLatest([
      this.connectorService.providerUserInfo$,
      this.connectorService.web3$,
    ]).pipe(
      take(1),
      switchMap(([info, web3]: [IProviderUserInfo, Web3]) => {
        if (tokenSymbol === TokenSymbol.ETH) {
          return web3.eth
            .getBalance(address)
            .then((b) => web3.utils.fromWei(b));
        }
        return this.getContractBalance$(
          info,
          address,
          tokenSymbol,
          tokenAddress
        );
      }),
      catchError((e) => {
        console.warn('ERROR GETTING BALANCE', e);
        return of('0');
      })
    );
  }

  private getContractBalance$(
    info: IProviderUserInfo,
    address: string,
    tokenSymbol?: TokenSymbol,
    tokenAddress?: string
  ): Promise<string> {
    if (!tokenSymbol && !tokenAddress) {
      throw new Error('Token symbol or address is required.');
    }
    let contract;
    if (tokenSymbol) {
      contract = this.connectorService.createErc20TokenContract(
        tokenSymbol,
        info.availableSmartContractAddresses
      );
    }
    if (!contract && tokenAddress) {
      this.connectorService.createErc20TokenContractFromAddress(tokenAddress);
    }

    if (!contract) {
      throw new Error(
        'No ERC20 contract for' + tokenSymbol + ' cAddr=' + tokenAddress
      );
    }
    return contract.methods
      .balanceOf(address)
      .call()
      .then((balance) => {
        console.log(
          'Balance',
          balance,
          tokenSymbol,
          TokenUtil.toDisplayDecimalValue(balance, tokenSymbol)
        );

        return TokenUtil.toDisplayDecimalValue(balance, tokenSymbol);
      }) as Promise<string>;
  }

  private getReefProtocolBalancesFromChain$(
    info: IProviderUserInfo,
    address: string
  ): Observable<Token[]> {
    const missingBalanceTokens = ApiService.REEF_PROTOCOL_TOKENS;

    return combineLatest(
      missingBalanceTokens.map((supportedConfig) => {
        let balance$: Observable<any>;
        const tokenAddress =
          info.availableSmartContractAddresses[supportedConfig.tokenSymbol];
        balance$ = this.getBalanceOnChain$(
          address,
          supportedConfig.tokenSymbol
        );

        return balance$.pipe(
          map(
            (balance) =>
              ({
                contract_ticker_symbol: supportedConfig.tokenSymbol,
                balance: +balance,
                address,
                contract_address: tokenAddress,
              } as Token)
          )
        );
      })
    );
  }
}
