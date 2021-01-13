import {Inject, LOCALE_ID, Pipe, PipeTransform} from '@angular/core';


@Pipe({
  name: 'categorize'
})
export class CategorizePipe implements PipeTransform {
  constructor(@Inject(LOCALE_ID) private locale: string) {
  }

  transform(items, category): unknown {
    return items.filter(item => {
      let name = item.contract_ticker_symbol || item.contract_name;
      if (!name) return true;
      if (category == 'token') {
        return name.indexOf('LP Token') == -1 || (name.length > 4 && name.indexOf('LP') == -1);
      }
      else if (category == 'defi') { //Assumes non-LP
        return name.indexOf('LP Token') != -1;
      }
    })

  }
}
