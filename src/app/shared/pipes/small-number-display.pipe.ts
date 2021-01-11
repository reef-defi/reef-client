import {Inject, LOCALE_ID, Pipe, PipeTransform} from '@angular/core';
import {formatNumber} from '@angular/common';

@Pipe({
  name: 'smallNumber'
})
export class SmallNumberPipe implements PipeTransform {
  constructor(@Inject(LOCALE_ID) private locale: string) {
  }

  transform(value: unknown, ...args: unknown[]): unknown {
    if (value < 1) {
      const fullValStr = value.toString();
      const separator = fullValStr.indexOf('.') > -1 ? '.' : ',';
      const separSplit = fullValStr.split(separator);
      const decimals = separSplit[1].split('');
      const indexAboveZero = decimals.findIndex(char => char !== '0');
      if (indexAboveZero > 2) {
        return '0' + separator + decimals.slice(0, indexAboveZero + 2).join('');
      }
    }
    return formatNumber(value as number, this.locale);
  }

}
