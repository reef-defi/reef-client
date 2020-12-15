import { Component, OnInit } from '@angular/core';
import { ConnectorService } from './core/services/connector.service';
import { PoolService } from './core/services/pool.service';
import { ApiService } from './core/services/api.service';
import { ContractService } from './core/services/contract.service';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  readonly VERSION = '0.2.3';
  providerName$ = this.connectorService.currentProviderName$;
  providerUserInfo$ = this.connectorService.providerUserInfo$;
  ethPrice$ = this.poolService.getEthPrice();

  constructor(
    private readonly connectorService: ConnectorService,
    private readonly poolService: PoolService,
    private readonly apiService: ApiService,
    private readonly contractService: ContractService,
    private readonly router: Router) {
  }

  ngOnInit(): void {
    this.apiService.getGasPrices().pipe(
      take(1)
    ).subscribe(data => {
      this.apiService.gasPrices$.next(data);
      const gasPrice = localStorage.getItem('reef_gas_price');
      if (gasPrice) {
        const gp = JSON.parse(gasPrice);
        this.connectorService.setSelectedGas(gp.type, gp.price);
      } else {
        this.connectorService.setSelectedGas('standard', data.standard);
      }
    });
  }

  async onSignOut(): Promise<void> {
    await this.connectorService.onDisconnect();
    window.location.reload();
  }

}
