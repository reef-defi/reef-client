import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortAddrDisplay',
})
export class ShortAddrDisplayPipe implements PipeTransform {
  transform(address: string, ...args: unknown[]): string {
    if (!address) {
      return '';
    }
    return (
      address.slice(0, 4) +
      '...' +
      address.slice(address.length - 4, address.length)
    );
  }
}
