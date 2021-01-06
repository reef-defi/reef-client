import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BehaviorSubject, EMPTY, Observable, of, Subscription} from 'rxjs';
import {
  IBasketHistoricRoi,
  IGenerateBasketRequest,
  IGenerateBasketResponse,
  IPoolsMetadata,
  QuotePayload,
  TokenBalance,
  Vault,
  VaultAPY
} from '../models/types';
import {subMonths} from 'date-fns';
import {catchError, map, shareReplay, take, tap} from 'rxjs/operators';
import {combineLatest} from 'rxjs/internal/observable/combineLatest';
import BigNumber from "bignumber.js";

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  })
};

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  readonly COMPOSITION_LIMIT = 10;
  public pools$ = new BehaviorSubject(null);
  public tokens$ = new BehaviorSubject(null);
  public vaults$ = new BehaviorSubject(null);
  public gasPrices$ = new BehaviorSubject(null);
  private url = environment.reefApiUrl;
  private reefPriceUrl = environment.cmcReefPriceUrl;
  private binanceApiUrl = environment.reefBinanceApiUrl;
  private gasPricesUrl = environment.gasPriceUrl;
  private chartsUrl = `https://charts.hedgetrade.com/cmc_ticker`;
  private reefNodeApi = environment.reefNodeApiUrl;
  private API_KEY = 'ckey_ae1ac511ecab4cf095e89c4fbff'; // 'ckey_02c001945c67428eaff497033d2';
  private balancesByAddr = new Map<string, Observable<any>>();


  constructor(private readonly http: HttpClient) {
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

  getTokenBalances(address: string, fromCache?: boolean): Observable<TokenBalance[]> {
    if (!address) {
      console.warn('getTokenBalances NO PARAMS');
      return null;
    }
    if (!fromCache || !this.balancesByAddr.has(address)) {
      const balances$ = this.http.get<any>(`${this.reefNodeApi}/covalent/${address}/balances`).pipe(
        catchError(err => {
          throw new Error(err)
        }),
        shareReplay(1)
      );
      this.balancesByAddr.set(address, balances$)
    }
    return this.balancesByAddr.get(address);
  }

  getTransactions(address: string) {
    return this.http.get<any>(`${this.reefNodeApi}/covalent/${address}/transactions`);
  }

  getReefPricing(from: string, to: string) {
    return this.http.get<any>(`${this.reefNodeApi}/covalent/reef-pricing?from=${from}&to=${to}`);
  }
}
