import { Component, Input } from '@angular/core';
import { Token, TokenSymbol } from '../../../core/models/types';

@Component({
  selector: 'app-exceeded-balance-msg',
  templateUrl: './exceeded-balance-msg.component.html',
  styleUrls: ['./exceeded-balance-msg.component.scss'],
})
export class ExceededBalanceMsgComponent {
  @Input()
  tokenAmount: number;
  @Input()
  selectedSymbol: TokenSymbol;
  @Input()
  tokenBalance: Token;

  hasBalanceForPayment(
    paymentValue: number,
    selectedToken: TokenSymbol,
    token: Token
  ): boolean {
    if (token.balance > 0) {
      return token.balance >= paymentValue;
    }
    return false;
  }
}
