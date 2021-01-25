import {Component, EventEmitter, Input, Output} from '@angular/core';
import {TokenSymbol} from "../../../core/models/types";

@Component({
  selector: 'app-set-input-relative-amount',
  templateUrl: './set-input-relative-amount.component.html',
  styleUrls: ['./set-input-relative-amount.component.scss']
})
export class SetInputRelativeAmountComponent {
  @Input()
  value: number;

  @Input()
  tokenSymbol: string;

  @Output()
  valueChange = new EventEmitter<number>();

  @Output()
  refreshBalance = new EventEmitter<number>();

  TokenSymbol = TokenSymbol;
}
