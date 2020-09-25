import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { ConnectorService } from '../services/connector.service';
import { NotificationService } from '../services/notification.service';

@Injectable({
  providedIn: 'root'
})
export class WalletGuard implements CanActivate {
  constructor(
    public readonly connectorService: ConnectorService,
    private readonly notificationService: NotificationService) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!this.connectorService.currentProviderName$.value) {
      this.notificationService.showNotification('Connect your wallet to proceed', 'Okay', 'info');
      return false;
    }
    return true;
  }
}
