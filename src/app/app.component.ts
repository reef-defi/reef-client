import { Component } from '@angular/core';
import { ConnectorService } from './core/services/connector.service';
import { PoolService } from './core/services/pool.service';
import { ApiService } from './core/services/api.service';
import { ContractService } from './core/services/contract.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  readonly VERSION = '0.0.3-alpha';
  providerName$ = this.connectorService.currentProviderName$;
  provider$ = this.connectorService.currentProvider$;
  providerUserInfo$ = this.connectorService.providerUserInfo$;
  ethPrice$ = this.poolService.getEthPrice();
  public canEnter = false;
  constructor(
    private readonly connectorService: ConnectorService,
    private readonly poolService: PoolService,
    private readonly apiService: ApiService,
    private readonly contractService: ContractService) {
    const pw = prompt('Welcome to Reef!');
    if (pw === 'let me in master') {
      this.canEnter = true;
    }
  }

}
