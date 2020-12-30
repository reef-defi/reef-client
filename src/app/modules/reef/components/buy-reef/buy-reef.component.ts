import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IReefPricePerToken } from '../../../../core/models/types';

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
  constructor() { }

  onBuy(tokenAmount: number): void {
    this.buy.emit(tokenAmount);
  }

  onTokenChange(tokenSymbol: number | string): void {
    this.tokenChange.emit(tokenSymbol);
  }

  onAmountChange(amount: number): void {
    this.amountChange.emit(amount);
  }
}
