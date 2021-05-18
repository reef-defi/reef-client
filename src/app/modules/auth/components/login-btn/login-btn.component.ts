import { Component, OnInit } from '@angular/core';
import { EthAuthService } from '../../eth-auth.service';
import {catchError, filter, map, take} from 'rxjs/operators';
import { InfoModalComponent } from '../../../../shared/components/info-modal/info-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs/internal/observable/of';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { OtpModalComponent } from '../otp-modal/otp-modal.component';
import { addresses } from '../../../../../assets/addresses';

@Component({
  selector: 'app-login-btn',
  templateUrl: './login-btn.component.html',
  styleUrls: ['./login-btn.component.scss'],
})
export class LoginBtnComponent {
  constructor(
    private ethAuthService: EthAuthService,
    private dialog: MatDialog
  ) {}

  login(): void {
    this.ethAuthService
      .get2feAddressSecret$()
      .pipe(
        switchMap(
          (res: {
            success: boolean;
            address: string;
            secret_url: string;
            message: string;
          }) => {
            if (res && res.success && res.address) {
              const dialog = this.dialog.open(OtpModalComponent, {
                data: {
                  title:
                    '2FA password ...' +
                    res.address.substring(res.address.length - 5),
                  secretUrl: res.secret_url,
                },
              });
              return dialog.afterClosed().pipe(
                filter((v) => !!v),
                switchMap((otpToken: string) =>
                  this.ethAuthService.verifyOtp$(otpToken)
                ),
                map((tokenMatchRes) => {
                  if (!!tokenMatchRes.success) {
                    return res;
                  }
                  throw new Error(tokenMatchRes.message || 'Could not login.');
                })
              );
            }
            throw new Error(res.message || 'Could not login.');
          }
        ),
        catchError((err) => {
          if (err && !err.success) {
            this.dialog.open(InfoModalComponent, {
              data: {
                title: 'Login error',
                message: err.message,
              },
            });
          }
          return of({});
        }),
        take(1)
      )
      .subscribe();
  }
}
