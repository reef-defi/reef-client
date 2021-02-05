import { Subject } from 'rxjs';

export class NgDestroyableComponent {
  onDestroyed$ = new Subject<void>();

  onDestroy() {
    this.onDestroyed$.next(null);
  }
}
