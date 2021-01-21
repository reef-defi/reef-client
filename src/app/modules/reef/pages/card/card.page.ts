import {ChangeDetectionStrategy, Component, OnDestroy} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../../environments/environment';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Observable, Subject} from 'rxjs';
import {switchMap} from 'rxjs/internal/operators/switchMap';
import {startWith} from 'rxjs/internal/operators/startWith';
import {catchError, shareReplay, takeUntil} from 'rxjs/operators';
import {of} from 'rxjs/internal/observable/of';
import {GoogleAnalyticsService} from '../../../../shared/service/google-analytics.service';
import {FbPixelService} from '../../../../shared/service/fb-pixel.service';

interface StatusInfo {
  notInterested?: string;
  message?: string;
  email?: string;
  error?: boolean;
}

@Component({
  selector: 'app-card-page',
  templateUrl: './card.page.html',
  styleUrls: ['./card.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardPage implements OnDestroy {

  statusInfo: Observable<StatusInfo>;
  loginForm: FormGroup;
  statusSub = new Subject<string>();
  destroyed = new Subject<void>();

  constructor(private http: HttpClient, fb: FormBuilder,
              googleAnalyticsService: GoogleAnalyticsService,
              fbPixelService: FbPixelService) {
    this.loginForm = fb.group({
      email: [null, Validators.compose([Validators.required, Validators.pattern(/^(\d{10}|\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,25}))$/)])],
    });

    this.statusInfo = this.statusSub.pipe(
      switchMap((status: any) => status.email ? this.http.post(environment.reefNodeApiUrl + '/card-interest', {email: status.email}) : of(status)),

      startWith({notInterested: true, message: null}),
      catchError(err => {
        if (err.error) {
          return of({message: err.error.message, error: true});
        }
        return of({message: 'Error saving email. Please try later.'});
      }),
      shareReplay(1)
    );

    this.statusInfo.pipe(
      takeUntil(this.destroyed),
    ).subscribe((info: StatusInfo) => {
      if (info.message === null && !info.notInterested) {
        // interested
        googleAnalyticsService.eventEmitter('view_item', 'engagement', 'cart_interest_open');
      } else if (info.email) {
        // ga. emailSent
        googleAnalyticsService.eventEmitter('sign_up', 'engagement', 'cart_interest_sent');
        fbPixelService.track(FbPixelService.LEAD_TYPE);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed.next(null);
  }

}
