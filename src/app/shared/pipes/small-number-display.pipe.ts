import { Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { formatNumber } from '@angular/common';
import BigNumber from 'bignumber.js';

@Pipe({
  name: 'smallNumber',
})
export class SmallNumberPipe implements PipeTransform {
  constructor(@Inject(LOCALE_ID) private locale: string) {}

  transform(
    value: number,
    minDecimalPlaces: number,
    maxDecimalPlaces?: number
  ): unknown {
    if (minDecimalPlaces == null) {
      minDecimalPlaces = 2;
    }
    if (maxDecimalPlaces == null) {
      maxDecimalPlaces = 2;
    }
    if (minDecimalPlaces > maxDecimalPlaces) {
      maxDecimalPlaces = minDecimalPlaces;
    }
    if (maxDecimalPlaces < minDecimalPlaces) {
      maxDecimalPlaces = minDecimalPlaces;
    }
    if (value < 1 && value > 0) {
      const fullValStr = new BigNumber(value, 10).toFixed();
      // const separator = fullValStr.indexOf('.') > -1 ? '.' : ',';
      // const separSplit = fullValStr.split(separator);
      const separSplit = fullValStr.split('.');
      if (separSplit.length === 2) {
        const decimals = separSplit[1].split('');
        const firstGT0NumberIndex = decimals.findIndex((char) => char !== '0');
        if (
          firstGT0NumberIndex > -1 &&
          firstGT0NumberIndex >= maxDecimalPlaces
        ) {
          maxDecimalPlaces = firstGT0NumberIndex + 2;
        }
      }

      // return formatNumber(value as number, this.locale, `1.${minDecimalPlaces}-${maxDecimalPlaces}`);
    }
    return formatNumber(
      value,
      this.locale,
      `1.${minDecimalPlaces}-${maxDecimalPlaces}`
    );
  }
}
