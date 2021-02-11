import { formatNumber } from '@angular/common';
import { Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { TokenSymbol } from '../../core/models/types';

@Pipe({
  name: 'decimal',
})
export class DecimalNumberPipe implements PipeTransform {
  constructor(@Inject(LOCALE_ID) private locale: string) {}

  transform(amount: number, price: number, token?: TokenSymbol): string {
    if (token && token === TokenSymbol.ETH) {
      return formatNumber(amount, this.locale, `1.0-5`);
    }
    if (amount * price < 1) {
      return formatNumber(amount, this.locale, `1.0-5`);
    }
    if (price < 1) {
      return formatNumber(amount, this.locale, `1.0-5`);
    }
    if (price < 10) {
      return formatNumber(amount, this.locale, `1.0-2`);
    }
    if (price > 100 && price < 1000) {
      return formatNumber(amount, this.locale, `1.0-2`);
    }
    if (price > 1000) {
      return formatNumber(amount, this.locale, `1.0-0`);
    }
    return formatNumber(amount, this.locale, `1.0-5`);
  }
}
