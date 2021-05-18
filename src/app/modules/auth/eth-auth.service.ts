import { Injectable } from '@angular/core';
import { ConnectorService } from '../../core/services/connector.service';
import { combineLatest } from 'rxjs/internal/observable/combineLatest';
import { Observable, Subject } from 'rxjs';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { IProviderUserInfo } from '../../core/models/types';
import { of } from 'rxjs/internal/observable/of';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EthAuthService {
  constructor(
    private connectorService: ConnectorService,
    private http: HttpClient
  ) {}

  getSignedLogin2feSecret$(): Observable<{ address: string }> {
    return combineLatest([
      this.connectorService.web3$,
      this.connectorService.providerUserInfo$,
    ]).pipe(
      switchMap(([web3, info]: [any, IProviderUserInfo]) =>
        this.getSignedMsg$(web3, info.address, 'login')
      ),
      switchMap((val: { signature: string; message: string }) => {
        const data = JSON.parse(val.message);
        return this.http.post(environment.reefNodeApiUrl + '/init-otp-signed', {
          sig: val.signature,
          data,
        }) as Observable<{ address: string }>;
      })
    );
  }

  get2feAddressSecret$(): Observable<{
    success: boolean;
    address: string;
    secret_url: string;
    message: string;
  }> {
    return this.connectorService.providerUserInfo$.pipe(
      switchMap((info: IProviderUserInfo) => {
        const data = { authWithAddress: info.address };
        return this.http.post(environment.reefNodeApiUrl + '/init-otp', {
          data,
        }) as Observable<{
          success: boolean;
          address: string;
          secret_url: string;
          message: string;
        }>;
      })
    );
  }

  private getSignedMsg$(
    web3: any,
    address: string,
    value: string
  ): Observable<any> {
    const msg = {
      authWithAddress: address,
      timestamp: new Date().getTime(),
      value,
    };
    const msgParams = JSON.stringify({
      domain: {
        chainId: web3.currentProvider.chainId,
        name: 'Reef Card Authentication',
        version: '1',
      },
      message: msg,
      primaryType: 'LoginRequest',
      types: {
        LoginRequest: [
          { name: 'authWithAddress', type: 'address' },
          { name: 'timestamp', type: 'uint256' },
          { name: 'value', type: 'string' },
        ],
      },
    });

    const params = [address, msgParams];
    // TODO handle other wallets that might support just eth_signTypedData
    const method = 'eth_signTypedData_v4';
    const resultSubj = new Subject();

    const sendFn = web3.currentProvider.send || web3.currentProvider.sendAsync;
    if (!sendFn) {
      console.warn('Auth sign function undefined.');
      return of(null);
    }

    sendFn(
      {
        method,
        params,
        address,
      },
      (err, result) => {
        if (err) {
          console.warn(err);
          resultSubj.next(null);
        }
        resultSubj.next({ signature: result.result, message: msgParams });
      }
    );
    return resultSubj;
  }

  verifyOtp$(
    otpToken: string
  ): Observable<{ valid: boolean; success: boolean; message: string }> {
    return combineLatest([
      this.connectorService.web3$,
      this.connectorService.providerUserInfo$,
    ]).pipe(
      switchMap(([web3, info]: [any, IProviderUserInfo]) =>
        this.getSignedMsg$(web3, info.address, otpToken)
      ),
      switchMap((val: { signature: string; message: string }) => {
        const data = JSON.parse(val.message);
        return this.http.post(
          environment.reefNodeApiUrl + '/verify-otp-token',
          { sig: val.signature, data }
        ) as Observable<{ valid: boolean; success: boolean; message: string }>;
      })
    );
  }
}
