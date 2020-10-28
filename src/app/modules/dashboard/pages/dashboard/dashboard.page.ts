import { Component, OnInit } from '@angular/core';
import { ConnectorService } from '../../../../core/services/connector.service';
import { PoolService } from '../../../../core/services/pool.service';
import { first } from 'rxjs/operators';
import { IProviderUserInfo, ITransaction } from '../../../../core/models/types';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss']
})
export class DashboardPage implements OnInit {
  readonly providerName$ = this.connectorService.currentProviderName$;
  readonly provider$ = this.connectorService.currentProvider$;
  readonly providerUserInfo$ = this.connectorService.providerUserInfo$;
  readonly ethPrice$ = this.poolService.getEthPrice();
  readonly transactionsForAccount$: Observable<ITransaction[]> =
    this.connectorService.transactionsForAccount$;

  constructor(private readonly connectorService: ConnectorService,
              private readonly poolService: PoolService) {
  }

  ngOnInit(): void {
    this.providerUserInfo$.pipe(
      first(ev => !!ev)
    ).subscribe((res: IProviderUserInfo) => {
      this.getTransactionsForAccount(res.address);
    });
  }

  private async getTransactionsForAccount(address: string): Promise<void> {
    await this.connectorService.getTransactionsForAddress(address);
  }
}
