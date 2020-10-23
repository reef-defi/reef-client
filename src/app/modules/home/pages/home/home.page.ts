import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ConnectorService } from '../../../../core/services/connector.service';
import { ContractService } from '../../../../core/services/contract.service';
import { first } from 'rxjs/operators';
import { hintSteps } from '../../../../shared/data/walkthrough_steps';

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
    private readonly contractService: ContractService) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    const hasViewed = localStorage.getItem('tutorialViewed');
    if (JSON.parse(hasViewed) !== true) {
      this.isWalletConnected$.pipe(
        first((el) => !!el)
      ).subscribe((data) => {
        if (data) {
          setTimeout(() => {
            this.EnjoyHint.set(hintSteps);
            this.EnjoyHint.run();
          }, 1000);
          localStorage.setItem('tutorialViewed', 'true');
        }
      });
    }
  }

  async onConnect(): Promise<any> {
    await this.connectorService.onConnect();
  }

  onDisconnect(): void {
    this.connectorService.onDisconnect();
  }
}
