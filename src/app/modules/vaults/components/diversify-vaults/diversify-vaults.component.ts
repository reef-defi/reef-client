import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-diversify-vaults',
  templateUrl: './diversify-vaults.component.html',
  styleUrls: ['./diversify-vaults.component.scss']
})
export class DiversifyVaultsComponent {
  @Input() ethAmount: FormControl | undefined;
  @Output() invest = new EventEmitter();
  @Output() diversifyChange = new EventEmitter<number>();

  onInvest(): void {
    this.invest.emit();
  }

  onDiversifyChange(amount: number): void {
    this.diversifyChange.emit(amount);
  }
}
