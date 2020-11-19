import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-create-basket',
  templateUrl: './create-basket.component.html',
  styleUrls: ['./create-basket.component.scss']
})
export class CreateBasketComponent {
  @Input() ethAmount: FormControl | undefined;
  @Input() riskAmount: FormControl | undefined;
  @Input() ethBalance: string;
  @Input() minimalInvestment: string | undefined;
  @Output() invest = new EventEmitter<void>();
  @Output() selectPercentage = new EventEmitter<number>();

  onInvest(): void {
    this.invest.emit();
  }

  onPercentageChange(val: number): void {
    this.selectPercentage.emit(val);
  }
}
