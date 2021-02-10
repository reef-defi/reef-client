import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import {TokenSymbol} from "../../../../core/models/types";

@Component({
  selector: 'app-holdings-table',
  templateUrl: './holdings-table.component.html',
  styleUrls: ['./holdings-table.component.scss'],
})
export class HoldingsTableComponent {
  TokenSymbol = TokenSymbol;
  constructor(private readonly router: Router) {}
  @Input() portfolio;

  goToReef() {
    this.router.navigate(['/reef/buy']);
  }
}
