import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TokenSymbol } from '../../../core/models/types';
import { TokenUtil } from '../../utils/token.util';

@Component({
  selector: 'app-set-input-relative-amount',
  templateUrl: './set-input-relative-amount.component.html',
  styleUrls: ['./set-input-relative-amount.component.scss'],
})
export class SetInputRelativeAmountComponent {
  private _tokenSymbol: TokenSymbol | string;
  @Input()
  value: number;

  @Input() set tokenSymbol(val: TokenSymbol | string) {
    this._tokenSymbol = TokenUtil.parseLPTokenName(val);
  };

  get tokenSymbol(): TokenSymbol | string {
    return this._tokenSymbol;
  }

  @Output()
  valueChange = new EventEmitter<number>();

  @Output()
  refreshBalance = new EventEmitter<number>();

  TokenSymbol = TokenSymbol;
  TokenUtil = TokenUtil;
}
