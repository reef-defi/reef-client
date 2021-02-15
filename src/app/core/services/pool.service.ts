import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { balancerPoolQuery, uniswapPoolQuery } from '../models/pool-queries';
import {combineLatest, Observable, Subject, timer} from 'rxjs';
import { shareReplay, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PoolService {
  private static ETH_PRICE_REFRESH_INTERVAL = 60000;

  refreshEthPrice = new Subject();
// TODO ethPrice$ should be moved to some other service
  ethPrice$: Observable<any> = combineLatest([this.refreshEthPrice, timer(
    0,
    PoolService.ETH_PRICE_REFRESH_INTERVAL
  )]) .pipe(
    switchMap(() => this.http.get(environment.ethPriceUrl)),
    shareReplay(1)
  );

  constructor(private readonly http: HttpClient) {}

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
}
