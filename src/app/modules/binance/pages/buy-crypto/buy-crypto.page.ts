import { Component, OnInit } from '@angular/core';
import { ConnectorService } from '../../../../core/services/connector.service';
import { ApiService } from '../../../../core/services/api.service';
import { first } from 'rxjs/internal/operators/first';
import { format } from 'date-fns';
import {
  IProviderUserInfo,
  QuotePayload,
  QuoteResponse,
} from '../../../../core/models/types';
import {
  catchError,
  debounceTime,
  filter,
  switchMap,
  take,
} from 'rxjs/operators';
import { BehaviorSubject, EMPTY, Observable, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { BinanceRegisterModalComponent } from '../../components/binance-register-modal/binance-register-modal.component';
import { tap } from 'rxjs/internal/operators/tap';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from '../../../../core/services/notification.service';
import { of } from 'rxjs/internal/observable/of';

@Component({
  selector: 'app-buy-crypto',
  templateUrl: './buy-crypto.page.html',
  styleUrls: ['./buy-crypto.page.scss'],
})
export class BuyCryptoPage implements OnInit {
  readonly userInfo$ = this.connectorService.providerUserInfo$;
  public binanceUserInfo$ = new BehaviorSubject(null);
  public hasBound = false;
  public registerError = null;
  public cryptoCurrencies = [
    { currency: 'ETH', src: 'eth.png' },
    { currency: 'USDT', src: 'usdt.png' },
  ];
  public selectedCrypto = this.cryptoCurrencies[0];
  public amount = 0;
  public quoteInformation = new BehaviorSubject<QuoteResponse | null>(null);
  public loading = false;
  public error = false;

  constructor(
    private readonly connectorService: ConnectorService,
    private readonly apiService: ApiService,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.userInfo$
      .pipe(first((val) => !!val))
      .subscribe((data: IProviderUserInfo) => {
        this.checkIfUserRegistered(data.address);
        this.createUserAfterBind(data.address);
      });
  }

  // public openDialog(action: 'register' | 'redirect'): void {
  //   const dialogRef = this.dialog.open(BinanceRegisterModalComponent, {
  //     width: '450px',
  //     data: {
  //       action,
  //     },
  //   });
  //   dialogRef
  //     .afterClosed()
  //     .pipe(take(1))
  //     .subscribe((email) => {
  //       if (email) {
  //         const address = this.userInfo$.value.address;
  //         action === 'register'
  //           ? this.registerBinanceUser(email, address)
  //           : this.redirectToBind(email).subscribe(({ redirectUrl }) =>
  //               window.open(redirectUrl)
  //             );
  //       }
  //     });
  // }

  public getQuote(): any {
    // this.loading = true;
    // const address = this.userInfo$.value.address;
    // const email = this.binanceUserInfo$.value.email;
    // const payload: QuotePayload = {
    //   address,
    //   cryptoCurrency: this.selectedCrypto.currency,
    //   baseCurrency: this.selectedCrypto.currency,
    //   requestedAmount: +this.amount,
    //   email,
    // };
    // if (!this.amount) {
    //   this.loading = false;
    //   this.quoteInformation.next(null);
    //   return;
    // }
    // return of(this.amount)
    //   .pipe(
    //     filter((amount: number) => amount && amount > 0),
    //     take(1),
    //     debounceTime(1000),
    //     switchMap((amount: number) => this.apiService.getBinanceQuote(payload)),
    //     catchError((e: HttpErrorResponse) => {
    //       this.loading = false;
    //       this.error = true;
    //       return EMPTY;
    //     })
    //   )
    //   .subscribe((data: QuoteResponse) => {
    //     this.loading = false;
    //     this.error = false;
    //     this.quoteInformation.next({
    //       ...data,
    //       totalPrice: this.amount * data.quotePrice,
    //     });
    //   });
  }

  public executeTrade() {
    // const address = this.userInfo$.value.address;
    // const { quoteId } = this.quoteInformation.value;
    // this.apiService.executeTrade(address, quoteId).subscribe();
  }

  private checkIfUserRegistered(address: string): Subscription {
    return this.apiService.checkIfUserRegistered(address).subscribe((data) => {
      if (data.userId) {
        this.hasBound = true;
        this.binanceUserInfo$.next(data);
      }
    });
  }

  private registerBinanceUser(email: string, address: string): Subscription {
    return this.apiService
      .registerBinanceUser(email, address)
      .pipe(
        tap((data) => {
          if (data.status === 'SUCCESS') {
            this.binanceUserInfo$.next({
              registerStatus: 'SUCCESS',
              userId: data.userId,
              email: data.email,
            });
            this.notificationService.showNotification(
              'Check your email to finish registering for your Binance account',
              'Ok',
              'success'
            );
          }
          if (data.status === 'USER_HAS_BIND') {
            this.binanceUserInfo$.next({
              registerStatus: 'USER_HAS_BIND',
              userId: data.userId,
              email: data.email,
            });
            this.notificationService.showNotification(
              'Seems like that email is already registered with Binance',
              'Ok',
              'info'
            );
          }
        }),
        switchMap((data) => this.redirectToBind(data.email)),
        catchError((err: HttpErrorResponse) => {
          this.registerError = err.error.message;
          return EMPTY;
        })
      )
      .subscribe((data: any) => {
        window.open(data.redirectUrl);
      });
  }

  private redirectToBind(email: string): Observable<any> {
    return this.apiService.bindBinanceUser(email);
  }

  private createUserAfterBind(address: string): Subscription {
    return this.route.queryParams
      .pipe(
        filter(
          (queryParams) =>
            queryParams.merchantCode &&
            queryParams.merchantUserAccount &&
            queryParams.userId
        ),
        take(1),
        switchMap((params) =>
          this.apiService.createUserAfterBind(
            params.merchantUserAccount,
            address,
            params.userId
          )
        )
      )
      .subscribe((response: any) => {
        if (response.status === 'SUCCESS') {
          this.hasBound = true;
          this.binanceUserInfo$.next({
            userId: response.userId,
            email: response.email,
          });
          this.notificationService.showNotification(
            'Successfully registered with Binance',
            'Close',
            'success'
          );
        }
      });
  }
}
