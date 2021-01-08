import { Component, Input, OnDestroy } from '@angular/core';
import { Subject, timer } from 'rxjs';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { mapTo, takeUntil, takeWhile } from 'rxjs/operators';
import { startWith } from 'rxjs/internal/operators/startWith';
import { scan } from 'rxjs/internal/operators/scan';

@Component({
  selector: 'app-number-counter',
  templateUrl: './number-counter.component.html',
  styleUrls: ['./number-counter.component.scss']
})
export class NumberCounterComponent implements OnDestroy {
  @Input()
  set end(endRange: number | string) {
    if (endRange) {
      endRange = +endRange;
      this.mCounterSub$.next(endRange);
    }
  }

  @Input() countInterval = 100;
  public currentNumber = 0;
  private mCounterSub$ = new Subject();
  private mOnDestroy$ = new Subject<void>();

  constructor() {
    this.mCounterSub$
      .pipe(
        switchMap(endRange => {
          return timer(0, this.countInterval).pipe(
            mapTo(this.positiveOrNegative(endRange, this.currentNumber)),
            startWith(this.currentNumber),
            scan((acc: number, curr: number) => acc + curr),
            takeWhile(this.isApproachingRange(endRange, this.currentNumber))
          );
        }),
        takeUntil(this.mOnDestroy$)
      )
      .subscribe((val: number) => this.currentNumber = val);
  }

  private positiveOrNegative(endRange, currentNumber): number {
    const step = this.calculateCountStep(endRange);
    return endRange > currentNumber ? step : -step;
  }

  private isApproachingRange(endRange, currentNumber): any {
    return endRange > currentNumber
      ? val => val <= endRange
      : val => val >= endRange;
  }

  private calculateCountStep(endRange: number): number {
    return endRange / 5;
  }

  ngOnDestroy(): void {
    this.mOnDestroy$.next();
    this.mOnDestroy$.complete();
  }
}
