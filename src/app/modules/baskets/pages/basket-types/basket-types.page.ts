import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-basket-types',
  templateUrl: './basket-types.page.html',
  styleUrls: ['./basket-types.page.scss'],
})
export class BasketTypesPage implements OnInit {
  public stableCoins = ['dai', 'usdc', 'usdt'];
  public erc20Coins = ['bal', 'comp', 'uni'];
  constructor() {}

  ngOnInit(): void {}
}
