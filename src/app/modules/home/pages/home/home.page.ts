import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ConnectorService } from '../../../../core/services/connector.service';
import { ContractService } from '../../../../core/services/contract.service';
import { first, take } from 'rxjs/operators';
import { hintSteps } from '../../../../shared/data/walkthrough_steps';
import { MatDialog } from '@angular/material/dialog';
import { DisclaimerModalComponent } from '../../components/disclaimer-modal/disclaimer-modal.component';
import { NotificationService } from '../../../../core/services/notification.service';
import { Router } from '@angular/router';
import ParticlesConfig from '../../../../../assets/particles-config';

declare const particlesJS: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit, AfterViewInit {
  public contract$ = this.contractService.basketContract$;
  public isWalletConnected$ = this.connectorService.currentProviderName$;

  constructor(
    private readonly connectorService: ConnectorService,
    private readonly contractService: ContractService,
    private readonly notificationService: NotificationService,
    private readonly router: Router,
    public dialog: MatDialog) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    particlesJS('particles', ParticlesConfig, null);
    this.afterRender();
  }

  async onConnect(): Promise<any> {
    try {
      await this.connectorService.onConnect();
    } catch (e) {

    }
  }

  async onDisconnect(): Promise<void> {
    await this.connectorService.onDisconnect();
  }

  openDisclaimer(): void {
    const ref = this.dialog.open(DisclaimerModalComponent, {width: '475px', panelClass: 'dialog__responsive'});
    ref.afterClosed().pipe(
      take(1),
    ).subscribe((accepted: boolean) => {
      if (accepted) {
        this.onConnect();
      } else {
        this.notificationService.showNotification('Please accept the terms in order to use our services', 'Close', 'error');
      }
    });
  }

  private afterRender(): void {
    const hasViewed = JSON.parse(localStorage.getItem('reef_tutorial_viewed')) === true;
    this.isWalletConnected$.pipe(
      first((el) => !!el)
    ).subscribe((data) => {
      if (data) {
        if (hasViewed) {
          this.router.navigate(['/baskets']);
        } else {
          setTimeout(() => {
            const EnjoyHint = new (window as any).EnjoyHint({});
            EnjoyHint.set(hintSteps);
            EnjoyHint.run();
          }, 1000);
          localStorage.setItem('reef_tutorial_viewed', 'true');
        }
      }
    });
  }
}
