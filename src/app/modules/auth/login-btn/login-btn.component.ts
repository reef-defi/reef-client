import {Component, OnInit} from '@angular/core';
import {EthAuthService} from '../eth-auth.service';
import {catchError} from 'rxjs/operators';
import {InfoModalComponent} from '../../../shared/components/info-modal/info-modal.component';
import {MatDialog} from '@angular/material/dialog';
import {of} from 'rxjs/internal/observable/of';
import {switchMap} from 'rxjs/internal/operators/switchMap';
import {Auth2faService} from '../auth-2fa.service';
import {OtpModalComponent} from '../otp-modal/otp-modal.component';
import {tap} from 'rxjs/internal/operators/tap';

@Component({
  selector: 'app-login-btn',
  templateUrl: './login-btn.component.html',
  styleUrls: ['./login-btn.component.scss'],
})
export class LoginBtnComponent {
  constructor(
    private ethAuthService: EthAuthService,
    private dialog: MatDialog
  ) {
  }

  login(): void {
    this.ethAuthService
      .login$()
      .pipe(
        catchError((err) => {
          if (!err.success) {
            this.dialog.open(InfoModalComponent, {
              data: {
                title: 'Login error',
                message: err.message,
              },
            });
          }
          return of({});
        })
      )
      .subscribe(
        (res: { success: boolean, address: string, secret_url: string }) => {
          if (res && res.success && res.address) {
            const dialog=this.dialog.open(OtpModalComponent, {
              data: {
                title: '2FA password',
                secretUrl: res.secret_url
              }
            });
            dialog.afterClosed().subscribe((otpToken) => {
              console.log('OTPPPP', otpToken);
              this.ethAuthService.verifyOtp$(otpToken).subscribe(console.log);
              }
            );
          }
        }
      );
  }
}
