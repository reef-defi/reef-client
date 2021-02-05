import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { ConnectorService } from '../services/connector.service';
import { NotificationService } from '../services/notification.service';

@Injectable({
  providedIn: 'root',
})
export class WalletGuard implements CanActivate {
  constructor(
    public readonly connectorService: ConnectorService,
    private readonly notificationService: NotificationService,
    private readonly router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (!this.connectorService.currentProviderName$.value) {
      this.notificationService.showNotification(
        'Connect your wallet to proceed',
        'Okay',
        'info'
      );
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 1000);
      return false;
    }
    return true;
  }
}
