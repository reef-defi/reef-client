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
  @Output() invest = new EventEmitter<void>();

  onInvest(): void {
    this.invest.emit();
  }
}
