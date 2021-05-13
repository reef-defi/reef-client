import {Injectable} from '@angular/core';
import {ConnectorService} from '../../core/services/connector.service';
import {combineLatest} from 'rxjs/internal/observable/combineLatest';
import {Observable, Subject} from 'rxjs';
import {switchMap} from 'rxjs/internal/operators/switchMap';
import {IProviderUserInfo} from '../../core/models/types';
import {of} from 'rxjs/internal/observable/of';
import {fromPromise} from 'rxjs/internal-compatibility';
import {tap} from 'rxjs/internal/operators/tap';
import {recoverTypedSignature_v4} from 'eth-sig-util';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EthAuthService {

  constructor(private connectorService: ConnectorService, private http: HttpClient) {
  }

  login$(): Observable<{ address: string }> {
    return combineLatest([this.connectorService.web3$, this.connectorService.providerUserInfo$])
      .pipe(
        switchMap(([web3, info]: [any, IProviderUserInfo]) => {
          return this.getSignedMsg$(web3, info.address)
            .pipe(
              tap((val) => {
                const {signature, message} = val;
                /*const sig = signature.substring(2);
                const r = '0x' + sig.substring(0, 64);
                const s = '0x' + sig.substring(64, 128);
                const v = parseInt(sig.substring(128, 130), 16);
                console.log('signed', r,s,v, isValidSignature);*/
                // TODO move to server - just an example how to get public key from signature
                /*console.log('SIG', signature);
                const data = JSON.parse(message);
                console.log('MSG', !!recoverTypedSignature_v4, data);
                const rec = recoverTypedSignature_v4({data, sig: signature});
                console.log('RRRR', rec, web3.utils.toChecksumAddress(info.address));*/
              })
            );
        }),
        switchMap((val: { signature: string, message: string }) => {
          const data = JSON.parse(val.message);
          return this.http.post(environment.reefNodeApiUrl + '/verify-auth-signature',
            {sig: val.signature, data}) as Observable<{ address: string }>;
        })
      );
  }

  private getSignedMsg$(web3: any, address: string): Observable<any> {
    const msg = {
      authWithAddress: address,
      timestamp: (new Date()).getTime()
    };
    const msgParams = JSON.stringify({
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
          {name: 'authWithAddress', type: 'address'},
          {name: 'timestamp', type: 'uint256'},
        ]
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
        resultSubj.next({signature: result.result, message: msgParams});
      });
    return resultSubj;
  }
}
