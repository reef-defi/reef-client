import { Component } from '@angular/core';
import { ConnectorService } from './core/services/connector.service';
import { PoolService } from './core/services/pool.service';
import { ApiService } from './core/services/api.service';
import { ContractService } from './core/services/contract.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  readonly VERSION = '0.2.0';
  providerName$ = this.connectorService.currentProviderName$;
  providerUserInfo$ = this.connectorService.providerUserInfo$;
  ethPrice$ = this.poolService.getEthPrice();
  public canEnter = false;

  constructor(
    private readonly connectorService: ConnectorService,
    private readonly poolService: PoolService,
    private readonly apiService: ApiService,
    private readonly contractService: ContractService,
    private readonly router: Router) {
    const pw = prompt('Welcome to Reef!');
    if (pw === 'open sesame') {
      this.canEnter = true;
    }
  }

  async onSignOut(): Promise<void> {
    await this.connectorService.onDisconnect();
    window.location.reload();
  }

}
