import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HistoricRoiChartOptions, IGenerateBasketResponse, PoolsChartOptions } from '../../../../core/models/types';
import { ThemePalette } from '@angular/material/core';

@Component({
  selector: 'app-basket-composition',
  templateUrl: './basket-composition.component.html',
  styleUrls: ['./basket-composition.component.scss']
})
export class BasketCompositionComponent {
  Object = Object;
  private mColors: ThemePalette[] = [
    'primary',
    'accent',
    'warn'];
  @Input() basket: IGenerateBasketResponse | undefined;
  @Input() poolChartOptions: Partial<PoolsChartOptions>;

  constructor() {
  }

  get colors(): ThemePalette[] {
    return [...this.mColors, ...this.mColors, ...this.mColors];
  }


}
