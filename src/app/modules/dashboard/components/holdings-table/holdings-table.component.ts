import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import {
  ChainId,
  ExchangeId,
  IChainData,
  IPortfolio,
  IProviderUserInfo,
  TokenSymbol,
} from '../../../../core/models/types';
import { MatDialog } from '@angular/material/dialog';
import { PriceNotSupportedDialogComponent } from '../price-not-supported-dialog/price-not-supported-dialog.component';

@Component({
  selector: 'app-holdings-table',
  templateUrl: './holdings-table.component.html',
  styleUrls: ['./holdings-table.component.scss'],
})
export class HoldingsTableComponent {
  ChainId = ChainId;
  TokenSymbol = TokenSymbol;
  ExchangeId = ExchangeId;
  @Input() chainInfo: IChainData | undefined;
  @Input() portfolio: IPortfolio;

  constructor(private readonly router: Router, private dialog: MatDialog) {}

  goToReef() {
    this.router.navigate(['/reef/buy']);
  }

  isPriceSupported(chainId: ChainId) {
    return this.chainInfo.chain_id === ChainId.MAINNET;
  }

  noPriceDialog() {
    const dialogRef = this.dialog.open(PriceNotSupportedDialogComponent);
  }
}
