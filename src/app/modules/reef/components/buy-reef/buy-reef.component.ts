import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IReefPricePerToken } from '../../../../core/models/types';
import {ApiService} from '../../../../core/services/api.service';
import {ConnectorService} from '../../../../core/services/connector.service';

@Component({
  selector: 'app-buy-reef',
  templateUrl: './buy-reef.component.html',
  styleUrls: ['./buy-reef.component.scss']
})
export class BuyReefComponent {
  @Input() tokenAmount = 1;
  @Input() selectedToken: string | undefined;
  @Input() tokenPrices: IReefPricePerToken | undefined;
  @Input() supportedTokens: any | undefined;
  @Input() ethPrice: number | undefined;
  @Input() loading: boolean | undefined;
  @Output() buy = new EventEmitter();
  @Output() tokenChange = new EventEmitter();
  @Output() amountChange = new EventEmitter();

  constructor(public connectorService: ConnectorService, public apiService: ApiService) { }

  onBuy(tokenAmount: number): void {
    this.buy.emit(tokenAmount);
  }

  onTokenChange(tokenSymbol: number | string): void {
    this.tokenChange.emit(tokenSymbol);
  }

  onAmountChange(amount: number): void {
    this.amountChange.emit(amount);
  }

  getTokenBalances(addr: string) {

  }
}
