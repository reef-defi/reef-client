import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
})
export class FilterPipe implements PipeTransform {
  transform(value: any[], filterBy: string, searchString): any[] {
    if (!value) {
      return [];
    }
    if (!filterBy) {
      return value;
    }
    return value.filter((val: any) =>
      val[filterBy]
        .toLocaleLowerCase()
        .includes(searchString.toLocaleLowerCase())
    );
  }
}
