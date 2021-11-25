import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
})
export class FilterPipe implements PipeTransform {
  transform(value: any[], filterBy: string, category: string): any[] {
    if (!value) {
      return [];
    }
    if (!filterBy) {
      return value;
    }
    if (!category) {
      return value.filter((v) => v.includes(filterBy));
    }

    const categories = category.split(',');
    filterBy = filterBy.toLocaleLowerCase();

    return value.filter((v) =>
      categories.some((cat) => {
        if (Array.isArray(v[cat])) {
          return (
            v[cat].filter((c) => c.toLowerCase().includes(filterBy)).length > 0
          );
        }
        return v[cat].toLowerCase().includes(filterBy);
      })
    );
  }
}
