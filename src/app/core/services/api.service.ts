import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, EMPTY, Observable, Subscription } from 'rxjs';
import { IBasketHistoricRoi, IGenerateBasketRequest, IGenerateBasketResponse, IPoolsMetadata } from '../models/types';
import { subMonths } from 'date-fns';
import { catchError } from 'rxjs/operators';

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
  private url = environment.testReefUrl;
  private chartsUrl = `https://charts.hedgetrade.com/cmc_ticker`;


  constructor(private readonly http: HttpClient) {
    this.listPools();
    this.listTokens();
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

  generateBasket(payload: IGenerateBasketRequest): Observable<IGenerateBasketResponse> {
    if (!payload.amount || !payload.risk_aversion) {
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

  getReefEthPrice(): Observable<{ [key: string]: { [key: string]: number} }> {
    return this.http.get<{ [key: string]: { [key: string]: number} }>(`${this.chartsUrl}/BTC,ETH?quote=USD`).pipe(
      catchError(err => EMPTY)
    );
  }
}
