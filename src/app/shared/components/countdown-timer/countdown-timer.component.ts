import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Observable, ReplaySubject, timer } from 'rxjs';
import { map, shareReplay, withLatestFrom } from 'rxjs/operators';
import { DateTimeUtil } from '../../utils/date-time.util';

@Component({
  selector: 'app-countdown-timer',
  templateUrl: './countdown-timer.component.html',
  styleUrls: ['./countdown-timer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountdownTimerComponent {
  expiredDateSub = new ReplaySubject();

  @Input()
  set expiresDate(val: Date | string) {
    this.expiredDateSub.next(DateTimeUtil.toDate(val));
  }

  @Input()
  accentColor: boolean;

  expiresCountdownTime$ = timer(0, 1000).pipe(
    map((_) => new Date()),
    withLatestFrom(this.expiredDateSub),
    map(([currTime, expiresDate]: [Date, Date]) => {
      return DateTimeUtil.getPositiveTimeDiff(currTime, expiresDate);
    }),
    shareReplay(1)
  ) as Observable<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>;
}
