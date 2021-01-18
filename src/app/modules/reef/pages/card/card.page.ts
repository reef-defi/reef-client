import {ChangeDetectionStrategy, Component, OnDestroy} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../../environments/environment';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Observable, Subject} from 'rxjs';
import {switchMap} from 'rxjs/internal/operators/switchMap';
import {startWith} from 'rxjs/internal/operators/startWith';
import {catchError, shareReplay, takeUntil} from 'rxjs/operators';
import {of} from 'rxjs/internal/observable/of';

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
  login_form: FormGroup;
  statusSub = new Subject<string>();
  destroyed = new Subject<void>();

  constructor(private http: HttpClient, fb: FormBuilder) {
    this.login_form = fb.group({
      email: [null, Validators.compose([Validators.required, Validators.pattern(/^(\d{10}|\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3}))$/)])],
    });

    this.statusInfo = this.statusSub.pipe(
      switchMap(status => status.email ? this.http.post(environment.reefNodeApiUrl + '/card-interest', {email: status.email}) : of(status)),
      startWith({notInterested: true, message: null}),
      catchError(err => of({message: 'There was a problem sending data. Please try later.', error: true})),
      shareReplay(1)
    );

    this.statusInfo.pipe(
      takeUntil(this.destroyed),
    ).subscribe((info: StatusInfo) => {
      if (info.message === null && !info.notInterested) {
        // interested
      } else if (info.email) {
        // ga. emailSent
      } else if (!!info.message && !!info.error) {
        // error with sending
      }
    });
    // page opened
  }

  ngOnDestroy() {
    this.destroyed.next(null);
  }

}
