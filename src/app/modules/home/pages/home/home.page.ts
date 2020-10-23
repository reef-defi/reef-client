import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ConnectorService } from '../../../../core/services/connector.service';
import { ContractService } from '../../../../core/services/contract.service';
import { first, take } from 'rxjs/operators';
import { hintSteps } from '../../../../shared/data/walkthrough_steps';
import { MatDialog } from '@angular/material/dialog';
import { DisclaimerModalComponent } from '../../components/disclaimer-modal/disclaimer-modal.component';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit, AfterViewInit {
  private readonly EnjoyHint = new (window as any).EnjoyHint({});
  public contract$ = this.contractService.basketContract$;
  public isWalletConnected$ = this.connectorService.currentProviderName$;

  constructor(
    private readonly connectorService: ConnectorService,
    private readonly contractService: ContractService,
    private readonly notificationService: NotificationService,
    public dialog: MatDialog) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    const hasViewed = localStorage.getItem('reef_tutorial_viewed');
    if (JSON.parse(hasViewed) !== true) {
      this.isWalletConnected$.pipe(
        first((el) => !!el)
      ).subscribe((data) => {
        if (data) {
          setTimeout(() => {
            this.EnjoyHint.set(hintSteps);
            this.EnjoyHint.run();
          }, 1000);
          localStorage.setItem('reef_tutorial_viewed', 'true');
        }
      });
    }
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
    const ref = this.dialog.open(DisclaimerModalComponent, {width: '475px'});
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
}
