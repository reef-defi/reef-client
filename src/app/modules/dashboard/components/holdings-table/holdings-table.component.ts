import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import {
  ExchangeId,
  IPortfolio,
  TokenSymbol,
} from '../../../../core/models/types';

@Component({
  selector: 'app-holdings-table',
  templateUrl: './holdings-table.component.html',
  styleUrls: ['./holdings-table.component.scss'],
})
export class HoldingsTableComponent {
  TokenSymbol = TokenSymbol;
  ExchangeId = ExchangeId;
  constructor(private readonly router: Router) {}
  @Input() portfolio: IPortfolio;

  goToReef() {
    this.router.navigate(['/reef/buy']);
  }
}
