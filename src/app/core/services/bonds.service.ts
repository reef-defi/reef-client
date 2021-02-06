import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {shareReplay} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {Bond} from '../models/types';
import {startWith} from 'rxjs/internal/operators/startWith';

@Injectable({
  providedIn: 'root'
})
export class BondsService {

  public bondsList$: Observable<Bond[]> = this.http.get('/api/bonds').pipe(
    startWith([{
      id: 1,
      bondName: 'Shell',
      bondDescription: '',
      stake: 'REEF',
      stakeTokenAddress: '',
      stakeTokenLogo: 'http://localhost:4200/assets/images/reef/reef-token.svg',
      stakeDecimals: false,
      farm: 'REEF',
      farmTokenAddress: '',
      farmTokenLogo: 'http://localhost:4200/assets/images/reef/reef-token.svg',
      farmStartTime: ((new Date()).getTime() - (1000 * 60 * 60 * 24 * 365)).toString(),
      farmEndTime: ((new Date()).getTime() + (1000 * 60 * 60 * 24 * 365)).toString(),
      entryExpirationTime: ((new Date()).getTime() - (1000 * 60 * 60)).toString(),
      apy: '40',
      lockDurationText: '1 year',
      bondContractAddress: ''
    } as Bond]),
    shareReplay(1)
  ) as Observable<Bond[]>;

  constructor(private http: HttpClient) {
  }
}
