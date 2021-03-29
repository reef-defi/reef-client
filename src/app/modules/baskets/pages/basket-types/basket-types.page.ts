import { Component, OnInit } from '@angular/core';
import { ConnectorService } from '../../../../core/services/connector.service';

@Component({
  selector: 'app-basket-types',
  templateUrl: './basket-types.page.html',
  styleUrls: ['./basket-types.page.scss'],
})
export class BasketTypesPage implements OnInit {
  public stableCoins = ['dai', 'usdc', 'usdt'];
  public erc20Coins = ['bal', 'comp', 'uni'];
  constructor(public readonly connectorService: ConnectorService) {}

  ngOnInit(): void {}
}
