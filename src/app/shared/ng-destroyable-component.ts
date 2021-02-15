import {Subject} from 'rxjs';
import {Component, OnDestroy} from '@angular/core';

@Component({
  template:''
})
export class NgDestroyableComponent implements OnDestroy {
  onDestroyed$ = new Subject<void>();

  ngOnDestroy(): void {
    this.onDestroyed$.next(null);
  }
}
