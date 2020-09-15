import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { balancerPoolQuery, uniswapPoolQuery } from '../models/pool-queries';
import { combineLatest } from 'rxjs';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PoolService {

  constructor(private readonly http: HttpClient) { }

  getAllPools(): Observable<any> {
    return combineLatest(this.getUniPool(), this.getBalancerPool());
  }

  getUniPool(): Observable<any> {
    const query = uniswapPoolQuery;
    return this.http.post(environment.uniswapPoolUrl, { query });
  }

  getBalancerPool(): Observable<any> {
    const query = balancerPoolQuery;
    return this.http.post(environment.balancerPoolUrl, { query });
  }

  getEthPrice(): Observable<any> {
    return this.http.get(environment.ethPriceUrl);
  }
}
