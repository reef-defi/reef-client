import { Component, OnInit } from '@angular/core';
import { ConnectorService } from '../../../../core/services/connector.service';
import { ContractService } from '../../../../core/services/contract.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit {
  public contract$ = this.contractService.contract$;
  public availableBasketCounts = 0;

  constructor(
    private readonly connectorService: ConnectorService, private readonly contractService: ContractService) {
  }

  ngOnInit(): void {
    this.connectorService.currentProviderName$
      .pipe(first(ev => !!ev))
      .subscribe((data: any) => {
      if (data) {
        this.connectToContract();
      }
    });
  }

  onConnect(): void {
    this.connectorService.onConnect();
  }

  onDisconnect(): void {
    this.connectorService.onDisconnect();
  }

  connectToContract(): void {
    this.contractService.connectToContract();
  }

  async getAvailableBasketCount(): Promise<any> {
    this.availableBasketCounts = await this.contractService.getAvailableBasketsCount();
  }

  async getAvailableBasket(): Promise<any> {
    const basket = await this.contractService.getAvailableBasket(0);
    console.log(basket);
  }
}
