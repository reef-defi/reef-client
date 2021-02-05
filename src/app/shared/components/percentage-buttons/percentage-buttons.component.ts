import { Component, EventEmitter, Input, Output } from '@angular/core';
import { roundDownTo } from '../../../core/utils/math-utils';

@Component({
  selector: 'app-percentage-buttons',
  templateUrl: './percentage-buttons.component.html',
  styleUrls: ['./percentage-buttons.component.scss'],
})
export class PercentageButtonsComponent {
  /**
   * The options that the user would have
   * to instantly add coins
   */
  public readonly percentages = [0.1, 0.25, 0.5, 0.9];
  @Input() value: number | undefined;
  @Output() selectPercentage = new EventEmitter<number>();

  onSelectPercentage(percentage: number): void {
    const val = roundDownTo(this.value * percentage, 3);
    this.selectPercentage.emit(val);
  }
}
