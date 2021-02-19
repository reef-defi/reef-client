import { Component, OnInit } from '@angular/core';
import { ConnectorService } from '../../../../core/services/connector.service';
import { ApiService } from '../../../../core/services/api.service';
import { first } from 'rxjs/internal/operators/first';
import { Token, TokenSymbol } from '../../../../core/models/types';
import { Observable } from 'rxjs';
import { TokenBalanceService } from '../../../../shared/service/token-balance.service';

@Component({
  selector: 'app-reef-menu',
  templateUrl: './reef-menu.page.html',
  styleUrls: ['./reef-menu.page.scss'],
})
export class ReefMenuPage implements OnInit {
  readonly providerUserInfo$ = this.connectorService.providerUserInfo$;
  reefBalance$: Observable<Token | undefined>;

  constructor(
    private readonly connectorService: ConnectorService,
    private readonly apiService: ApiService,
    private readonly tokenBalanceService: TokenBalanceService
  ) {}

  ngOnInit(): void {
    this.connectorService.providerUserInfo$
      .pipe(first((ev) => !!ev))
      .subscribe(({ address }) => {
        this.reefBalance$ = this.tokenBalanceService.getTokenBalance$(
          address,
          TokenSymbol.REEF
        );
      });
  }
}
