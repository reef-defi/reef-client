import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IGenerateBasketRequest, IGenerateBasketResponse, IPoolsMetadata } from '../models/types';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
  })
};
@Injectable({
  providedIn: 'root'
})
export class BasketsService {
  private url = environment.testReefUrl;


  constructor(private readonly http: HttpClient) {
  }

  listPools(): Observable<IPoolsMetadata[]> {
    return this.http.get<IPoolsMetadata[]>(`${this.url}/list_pools`);
  }

  generateBasket(payload: IGenerateBasketRequest): Observable<IGenerateBasketResponse> {
    return this.http.post<IGenerateBasketResponse>(`${this.url}/generate_basket`, payload, httpOptions);
  }

  getHistoricRoi(payload: IGenerateBasketResponse): Observable<any> {
    return this.http.post<any>(`${this.url}/basket_historic_roi`, payload, httpOptions);
  }
}
