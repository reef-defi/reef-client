import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EMPTY, Observable } from 'rxjs';
import { IBasketHistoricRoi, IGenerateBasketRequest, IGenerateBasketResponse, IPoolsMetadata } from '../models/types';
import { subMonths } from 'date-fns';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  })
};

@Injectable({
  providedIn: 'root'
})
export class BasketsService {
  readonly COMPOSITION_LIMIT = 10;
  private url = environment.testReefUrl;


  constructor(private readonly http: HttpClient) {
  }

  listPools(): Observable<IPoolsMetadata[]> {
    return this.http.get<IPoolsMetadata[]>(`${this.url}/list_pools`);
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
    return this.http.post<any>(`${this.url}/basket_historic_roi`, body, httpOptions);
  }
}
