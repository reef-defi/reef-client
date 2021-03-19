import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import {
  ChainId,
  ExchangeId,
  IPortfolio,
  IProviderUserInfo,
  TokenSymbol,
} from '../../../../core/models/types';

@Component({
  selector: 'app-holdings-table',
  templateUrl: './holdings-table.component.html',
  styleUrls: ['./holdings-table.component.scss'],
})
export class HoldingsTableComponent {
  ChainId = ChainId;
  TokenSymbol = TokenSymbol;
  ExchangeId = ExchangeId;
  @Input() chainInfo: IProviderUserInfo | undefined;
  @Input() portfolio: IPortfolio;
  constructor(private readonly router: Router) {}

  goToReef() {
    this.router.navigate(['/reef/buy']);
  }

  isPriceSupported(chainId: ChainId) {
    return this.chainInfo.chain_id === ChainId.MAINNET;
  }
}
