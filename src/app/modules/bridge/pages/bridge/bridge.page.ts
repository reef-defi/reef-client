import { Component, OnInit } from '@angular/core';
import { TokenBalanceService } from '../../../../shared/service/token-balance.service';
import { Observable } from 'rxjs';
import {
  ChainId,
  IProviderUserInfo,
  Token,
  TokenSymbol,
} from '../../../../core/models/types';
import { first } from 'rxjs/internal/operators/first';
import { ConnectorService } from '../../../../core/services/connector.service';
import { of } from 'rxjs/internal/observable/of';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationComponent } from '../../components/confirmation/confirmation.component';

@Component({
  selector: 'app-bridge',
  templateUrl: './bridge.page.html',
  styleUrls: ['./bridge.page.scss'],
})
export class BridgePage implements OnInit {
  ChainId = ChainId;
  public reefBalance$: Observable<Token | undefined>;
  public info$: Observable<IProviderUserInfo | undefined>;
  public reefAmount: number | undefined;
  constructor(
    private readonly tokenBalanceService: TokenBalanceService,
    private readonly connectorService: ConnectorService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.connectorService.providerUserInfo$
      .pipe(first((ev) => !!ev))
      .subscribe((info: IProviderUserInfo) => {
        this.info$ = of(info);
        this.reefBalance$ = this.tokenBalanceService.getTokenBalance$(
          info.address,
          TokenSymbol.REEF
        );
      });
  }

  public async openConfirmModal() {
    console.log('Wtf');
    const info = await this.info$.toPromise();
    this.dialog.open(ConfirmationComponent, {
      data: {
        info,
        amount: this.reefAmount,
      },
    });
  }
}
