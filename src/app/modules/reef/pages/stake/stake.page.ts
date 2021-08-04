import { Component, OnInit } from '@angular/core';
import { ConnectorService } from '../../../../core/services/connector.service';
import { TokenSymbol, TransactionType } from '../../../../core/models/types';

@Component({
  selector: 'app-stake',
  templateUrl: './stake.page.html',
  styleUrls: ['./stake.page.scss']
})
export class StakePage implements OnInit {
  TransactionType = TransactionType;
  TokenSymbol = TokenSymbol;

  constructor(private readonly connectorService: ConnectorService) { }

  ngOnInit(): void {
  }

}
