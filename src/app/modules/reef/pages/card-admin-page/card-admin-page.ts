import {Component, OnDestroy, TemplateRef, ViewChild,} from '@angular/core';
import {ConnectorService} from '../../../../core/services/connector.service';
import {HttpClient, HttpEventType, HttpResponseBase,} from '@angular/common/http';
import {BehaviorSubject, combineLatest, merge, Observable, ReplaySubject, Subject,} from 'rxjs';
import {catchError, distinctUntilChanged, filter, map, shareReplay, take, takeUntil,} from 'rxjs/operators';
import {switchMap} from 'rxjs/internal/operators/switchMap';
import {of} from 'rxjs/internal/observable/of';
import {MatDialog} from '@angular/material/dialog';
import {NotificationService} from '../../../../core/services/notification.service';
import {EthAuthService} from '../../../../core/services/eth-auth.service';
import {environment} from '../../../../../environments/environment';
import {startWith} from 'rxjs/internal/operators/startWith';
import {IProviderUserInfo, Token, TokenSymbol,} from '../../../../core/models/types';
import {NgDestroyableComponent} from '../../../../shared/ng-destroyable-component';
import {TokenBalanceService} from '../../../../shared/service/token-balance.service';
import {TokenUtil} from 'src/app/shared/utils/token.util';
import {countryCodes} from '../../../../shared/data/country_codes';
import {CountryISO, PhoneNumberFormat, SearchCountryField,} from 'ngx-intl-tel-input';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'app-card-admin-page',
  templateUrl: './card-admin-page.html',
  styleUrls: ['./card-admin-page.scss'],
})
export class CardAdminPage extends NgDestroyableComponent implements OnDestroy {
  set supportedTokens(val: { tokenSymbol: TokenSymbol; src: string }[]) {
    this.supportedTokensSub.next(val);
    this.selTokenSub.next(val[0].tokenSymbol);
  }

  baanxBaseUrl = 'https://reeffinance.baanx.co.uk';
  cardBaseUrl = environment.reefNodeApiUrl;
  accountCardRegistered$: Observable<boolean>;
  cardVerified$: Observable<boolean>;
  iframeSession$: Observable<any>;
  createUser: Subject<any> = new Subject<any>();
  destroyed$ = new Subject<void>();
  @ViewChild('cardFormDialog') cardFormDialog: TemplateRef<any>;
  loading$: Observable<boolean>;

  selectedTokenBalance$: Observable<Token>;
  supportedTokensSub = new BehaviorSubject<{ tokenSymbol: TokenSymbol; src: string }[]>([]);
  selTokenSub = new ReplaySubject<TokenSymbol>();
  tokenAmountSub = new BehaviorSubject<number>(null);
  TokenSymbol = TokenSymbol;
  cardBalance$: Observable<string>;
  TokenUtil = TokenUtil;
  GENDER_OPTIONS: { v: string; l: string }[] = [
    {v: 'M', l: 'Male'},
    {v: 'F', l: 'Female'},
  ];
  countryCodes = countryCodes;
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [
    CountryISO.UnitedStates,
    CountryISO.Turkey,
    CountryISO.Brazil,
    CountryISO.Italy,
    CountryISO.Vietnam,
    CountryISO.UnitedKingdom,
    CountryISO.India,
    CountryISO.Russia,
    CountryISO.Indonesia,
    CountryISO.Germany,
    CountryISO.Australia,
    CountryISO.Indonesia,
    CountryISO.Spain,
    CountryISO.France,
    CountryISO.Canada,
    CountryISO.Thailand,
    CountryISO.Japan,
    CountryISO.Argentina,
    CountryISO.Ukraine,
    CountryISO.Malaysia,
    CountryISO.Poland,
    CountryISO.Romania,
    CountryISO.China,
    CountryISO.Singapore,
    CountryISO.Switzerland,
    CountryISO.Portugal,
  ];
  displayFormNotValid: boolean;

  constructor(
    public readonly connectorService: ConnectorService,
    private dialog: MatDialog,
    private notificationService: NotificationService,
    private ethAuthService: EthAuthService,
    private http: HttpClient,
    private tokenBalanceService: TokenBalanceService
  ) {
    super();
    this.supportedTokens = TokenBalanceService.SUPPORTED_CARD_TOKENS;
    const existingUser$ = connectorService.providerUserInfo$.pipe(
      switchMap((userInfo: any) => {
        if (userInfo) {
          return this.http
            .get(this.cardBaseUrl + '/card/' + userInfo.address)
            .pipe(
              catchError((e) => {
                if (e.status === 404 || e.status === 400) {
                  return of({type: HttpEventType.Response});
                }
                return of({error: e.message, type: HttpEventType.Response});
              })
            );
        }
        return of({
          _status: {message: 'No wallet connected'},
        });
      })
    );

    const newUserCreated$ = this.createUser.asObservable().pipe(
      switchMap((newUser: any) => {
        return this.ethAuthService.signCardApplication$(
          JSON.stringify(newUser)
        );
      }),
      switchMap((uData) => this.http
        .post(this.cardBaseUrl + '/card', uData).pipe(
          map((v: any) => {
            if (!!v && !!v.error) {
              console.warn('Error 0 creating user', v);
              return {error: v.error.message, type: HttpEventType.Response};
            }
            this.notificationService.showNotification(
              'Card application received.',
              'Close',
              'success'
            );
            return v;
          }),
          catchError((e) => {
            console.warn('Error 1 creating user', e);
            return of({
              error: e.error.message,
              type: HttpEventType.Response,
            });
          }),
          startWith({type: HttpEventType.Sent})
        )
      )
    );
    const userData$ = merge(existingUser$, newUserCreated$).pipe(
      shareReplay(1)
    );
    // TODO display loading
    this.loading$ = userData$.pipe(
      map((v: any) =>
        !!v && !!v.external_id ? {type: HttpEventType.Response} : v
      ),
      filter((v) => this.isRequestStatus(v)),
      map((event: any) => {
        switch (event.type) {
          case HttpEventType.Sent:
            console.log('Request sent!');
            return true;
            break;
          case HttpEventType.ResponseHeader:
            console.log('Response header received!');
            return true;
            break;
          case HttpEventType.UploadProgress:
            // const percentDone = Math.round(100 * event.loaded / event.total);
            console.log(`File is being uploaded.`);
            return true;
          case HttpEventType.DownloadProgress:
            // const kbLoaded = Math.round(event.loaded / 1024);
            console.log(`Download in progress!`);
            return true;
            break;
          case HttpEventType.Response:
            console.log('😺 Done!', event.body);
            return false;
        }
      }),
      startWith(true),
      distinctUntilChanged()
    );
    const baanxUser$ = userData$.pipe(
      filter((v) => !!this.isBaanxUser(v)),
      map((res: any) => (!!res && !res.error ? res : null)),
      shareReplay(1)
    );
    this.cardVerified$ = baanxUser$.pipe(
      map((user: any) => !!user && !!user.verification_state),
      shareReplay(1)
    );
    this.accountCardRegistered$ = baanxUser$.pipe(
      map((res) => !!res),
      shareReplay(1)
    );
    this.iframeSession$ = baanxUser$.pipe(
      switchMap((bUser: any) =>
        bUser
          ? this.http.post(this.cardBaseUrl + '/card/session', {
            reefCardId: bUser.external_id,
          })
          : of({error: true, type: HttpEventType.Response})
      ),
      catchError((v) => {
        return of({error: true, type: HttpEventType.Response});
      }),
      shareReplay(1)
    );

    userData$
      .pipe(
        takeUntil(this.destroyed$),
        filter((e: any) => {
          const skip = !!e && !!e.error;
          return skip;
        }),
        map((e) => (e.error ? e.error : e))
      )
      .subscribe((errMsg: any) => {
        this.dialog.closeAll();
        this.notificationService.showNotification(
          errMsg.message || errMsg,
          'Close',
          'error'
        );
      });

    this.selectedTokenBalance$ = combineLatest([
      this.selTokenSub,
      this.connectorService.providerUserInfo$.pipe(filter((v) => !!v)),
    ]).pipe(
      switchMap(([tokenSymbol, uInfo]: [TokenSymbol, IProviderUserInfo]) =>
        this.tokenBalanceService.getTokenBalance$(uInfo.address, tokenSymbol)
      ),
      shareReplay(1)
    ) as Observable<Token>;

    this.selTokenSub
      .pipe(takeUntil(this.onDestroyed$))
      .subscribe(() => this.tokenAmountSub.next(null));
  }

  private isRequestStatus(v): boolean {
    // TODO find better solution for checking response
    const isReqStat =
      v instanceof HttpResponseBase || (!!v && !!v.type != null);
    console.log('STAT=', isReqStat, v);
    return isReqStat;
  }

  private isBaanxUser(v): boolean {
    // TODO find better solution for checking response
    return !!v && !!v.external_id;
  }

  ngOnDestroy(): void {
    this.destroyed$.next(null);
  }

  openCardForm(): void {
    this.dialog
      .open(this.cardFormDialog, {})
      .afterClosed()
      .pipe(take(1))
      .subscribe((formData: boolean) => {
        if (formData) {
          // createUser.next({address: userInfo.address})
        }
      });
  }

  transferToCard(): void {
    //TODO when we get the API endpoint
  }

  setCountryName(cardData: any, countryCode: any, countries: any[]): void {
    cardData.countryName = countries.find(
      (c) => c['alpha-2'] === countryCode
    ).name;
  }

  setPhone(countryCode: string, phoneNr: string, cardData: any): void {
    cardData.country_code = '+' + countryCode;
    cardData.phone_number = phoneNr;
  }

  setDate(value: any, cardData: any): void {
    try {
      const date = new Date(value);
      cardData.dateOfBirth = date.toISOString();
    }catch (e){}
  }

  sendCardData(cardData: NgForm): void {
    if (cardData.valid && !!cardData.value.phone_number && !!cardData.value.country_code && !!cardData.value.dateOfBirth) {
      this.displayFormNotValid = false;
      this.dialog.closeAll();
      this.createUser.next(cardData.value);
    } else {
      this.displayFormNotValid = true;
    }
  }
}
