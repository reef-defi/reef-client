import {Component, Input} from '@angular/core';
import {Token, TokenSymbol} from '../../../core/models/types';

@Component({
  selector: 'app-exceeded-balance-msg',
  templateUrl: './exceeded-balance-msg.component.html',
  styleUrls: ['./exceeded-balance-msg.component.scss']
})
export class ExceededBalanceMsgComponent {
  @Input()
  tokenAmount: number;
  @Input()
  selectedSymbol: TokenSymbol;
  @Input()
  balances: Token[];

  hasBalanceForPayment(paymentValue: number, selectedToken: TokenSymbol, balances: Token[]) {
    const tokenBalance = this.getTokenBalance(balances, selectedToken);
    if (tokenBalance && tokenBalance.balance > 0) {
      return tokenBalance.balance >= paymentValue;
    }
    return false;
  }

  getTokenBalance(balances: Token[], selectedToken: TokenSymbol) {
    return balances.find(b => selectedToken === TokenSymbol[b.contract_ticker_symbol]);
  }
}
