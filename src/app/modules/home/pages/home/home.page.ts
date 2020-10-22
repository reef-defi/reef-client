import { Component, OnInit } from '@angular/core';
import { ConnectorService } from '../../../../core/services/connector.service';
import { ContractService } from '../../../../core/services/contract.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit {
  public contract$ = this.contractService.basketContract$;
  public isWalletConnected$ = this.connectorService.currentProviderName$;

  constructor(
    private readonly connectorService: ConnectorService,
    private readonly contractService: ContractService,
    private readonly router: Router) {
  }

  ngOnInit(): void {
  }

  async onConnect(): Promise<any> {
    await this.connectorService.onConnect();
    if (this.contract$.value) {
      await this.router.navigate(['/baskets']);
    }
  }

  onDisconnect(): void {
    this.connectorService.onDisconnect();
  }
}
