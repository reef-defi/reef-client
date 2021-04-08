import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IGenerateBasketResponse } from '../../../../core/models/types';
import { ThemePalette } from '@angular/material/core';

@Component({
  selector: 'app-custom-basket-composition',
  templateUrl: './custom-basket-composition.component.html',
  styleUrls: ['./custom-basket-composition.component.scss'],
})
export class CustomBasketCompositionComponent {
  Object = Object;
  @Input() basket: IGenerateBasketResponse | undefined;
  @Input() disabledSlider: boolean | undefined;
  @Input() errorSymbol: string;
  @Output() removePool = new EventEmitter<string>();
  @Output() invest = new EventEmitter();
  @Output() changeAllocation = new EventEmitter();

  onRemovePool(symbol: string): void {
    this.removePool.emit(symbol);
  }

  onInvest(): void {
    this.invest.emit();
  }

  onAllocChange(symbol: string, event: any): void {
    this.changeAllocation.emit([symbol, event]);
  }
}
