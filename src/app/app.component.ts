import { Component } from '@angular/core';
import { ConnectorService } from './core/services/connector.service';
import { PoolService } from './core/services/pool.service';
import { ApiService } from './core/services/api.service';
import { first } from 'rxjs/operators';
import { ContractService } from './core/services/contract.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  providerName$ = this.connectorService.currentProviderName$;
  provider$ = this.connectorService.currentProvider$;
  providerUserInfo$ = this.connectorService.providerUserInfo$;
  ethPrice$ = this.poolService.getEthPrice();

  constructor(
    private readonly connectorService: ConnectorService,
    private readonly poolService: PoolService,
    private readonly apiService: ApiService,
    private readonly contractService: ContractService) {
    this.connectorService.currentProviderName$
      .pipe(first(ev => !!ev))
      .subscribe((data: any) => {
        if (data) {
          this.connectToContract();
        }
      });
  }

  private connectToContract(): void {
    this.contractService.connectToContract();
  }

}
