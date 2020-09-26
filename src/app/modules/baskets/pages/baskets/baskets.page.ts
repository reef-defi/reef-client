import { Component, OnInit } from '@angular/core';
import { ContractService } from '../../../../core/services/contract.service';
import { first } from 'rxjs/operators';
import { ConnectorService } from '../../../../core/services/connector.service';

@Component({
  selector: 'app-baskets',
  templateUrl: './baskets.page.html',
  styleUrls: ['./baskets.page.scss']
})
export class BasketsPage implements OnInit {
  contract$ = this.contractService.contract$;
  baskets$ = this.contractService.baskets$;

  constructor(
    private readonly contractService: ContractService,
    private readonly connectorService: ConnectorService) {
  }

  ngOnInit(): void {
    if (this.contract$.value) {
      this.getAllBaskets();
    } else {
      this.connectorService.currentProviderName$
        .pipe(first(ev => !!ev))
        .subscribe((data: any) => {
          if (data) {
            this.connectToContract();
            this.getAllBaskets();
          }
        });
    }
  }

  async getAllBaskets(): Promise<any> {
    await this.contractService.getAllBaskets();
  }

  private connectToContract(): void {
    this.contractService.connectToContract();
  }
}
