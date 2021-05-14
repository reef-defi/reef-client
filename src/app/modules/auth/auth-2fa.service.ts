import { Injectable } from '@angular/core';
import { ConnectorService } from '../../core/services/connector.service';
import { combineLatest } from 'rxjs/internal/observable/combineLatest';
import { Observable, Subject } from 'rxjs';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { IProviderUserInfo } from '../../core/models/types';
import { of } from 'rxjs/internal/observable/of';
import { fromPromise } from 'rxjs/internal-compatibility';
import { tap } from 'rxjs/internal/operators/tap';
import { recoverTypedSignature_v4 } from 'eth-sig-util';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Auth2faService {
  constructor(
    private connectorService: ConnectorService,
    private http: HttpClient,
    // private qrCode: QRCode
  ) {}

  get2faQrCode$(address: string): Observable<any> {
    if (address) {
      const secretUrl = 'otpauth://totp/Reef%202FA?secret=' + address;
      return of(null);
    }
    return of(null);
  }
}
