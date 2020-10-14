import { Component, OnInit } from '@angular/core';
import { ConnectorService } from '../../../../core/services/connector.service';
import { ContractService } from '../../../../core/services/contract.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit {
  public contract$ = this.contractService.contract$;
  public isWalletConnected$ = this.connectorService.currentProviderName$;
  public availableBasketCounts = 0;

  constructor(
    private readonly connectorService: ConnectorService, private readonly contractService: ContractService) {
  }

  ngOnInit(): void {
  }

  onConnect(): void {
    this.connectorService.onConnect();
  }

  onDisconnect(): void {
    this.connectorService.onDisconnect();
  }
}
