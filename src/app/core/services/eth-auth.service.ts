import { Injectable } from '@angular/core';
import { ConnectorService } from './connector.service';
import { combineLatest } from 'rxjs/internal/observable/combineLatest';
import { Observable, Subject } from 'rxjs';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { IProviderUserInfo } from '../models/types';
import { of } from 'rxjs/internal/observable/of';
import { tap } from 'rxjs/internal/operators/tap';
import { recoverTypedSignature_v4 } from 'eth-sig-util';

@Injectable({
  providedIn: 'root',
})
export class EthAuthService {
  constructor(private connectorService: ConnectorService) {}

  signCardApplication$(userDataJSON: string): Observable<any> {
    return combineLatest([
      this.connectorService.web3$,
      this.connectorService.providerUserInfo$,
    ]).pipe(
      switchMap(([web3, info]: [any, IProviderUserInfo]) => {
        return this.getSignedMsg$(web3, info.address, userDataJSON);
      })
    );
  }

  private getSignedMsg$(
    web3: any,
    address: string,
    data: string = ''
  ): Observable<any> {
    const msg = {
      authWithAddress: address,
      timestamp: new Date().getTime(),
      data,
    };
    const msgParams = {
      domain: {
        // Defining the chain aka Rinkeby testnet or Ethereum Main Net
        chainId: 1,
        // Give a user friendly name to the specific contract you are signing for.
        name: 'Reef Card Authentication',
        // Just let's you know the latest version. Definitely make sure the field name is correct.
        version: '1',
      },

      // Defining the message signing data content.
      message: msg,
      // Refers to the keys of the *types* object below.
      primaryType: 'LoginRequest',
      types: {
        LoginRequest: [
          { name: 'authWithAddress', type: 'address' },
          { name: 'timestamp', type: 'uint256' },
          { name: 'data', type: 'string' },
        ],
      },
    };

    const msgParamsJson = JSON.stringify(msgParams);
    const params = [address, msgParamsJson];
    // TODO handle other wallets that might support just eth_signTypedData
    const method = 'eth_signTypedData_v4';
    const resultSubj = new Subject();

    const sendFn = web3.currentProvider.sendAsync || web3.currentProvider.send;
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
        console.log('signedRES=', result, msgParams);
        resultSubj.next({ signature: result.result, message: msgParams });
      }
    );
    return resultSubj;
  }
}
