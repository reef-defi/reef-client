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
      this.connectorService.providerUserInfo$
        .pipe(first(ev => !!ev))
        .subscribe((data: any) => {
          if (data) {
            this.connectToContract();
            this.getAllBaskets();
          }
        });
    }
  }

  onBasketInvest(basketInfo: any): void {
    console.log(basketInfo);
    const { basketIdx, weights, name } = basketInfo;
    this.contractService.investInBasket([0, 1], [50, 50], 1);
  }

  async getAllBaskets(): Promise<any> {
    await this.contractService.getAllBaskets();
  }

  private connectToContract(): void {
    this.contractService.connectToContract();
  }
}
