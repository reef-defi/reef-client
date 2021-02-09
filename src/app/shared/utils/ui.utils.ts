import {DateTimeUtil} from './date-time.util';

export class UiUtils {
  static keydownPreventDecimal($event: any): void {
    if ($event.key === '.' || $event.key === ',') {
      $event.preventDefault();
    }
  }

  static toMinTimespanText(
    startDate: Date | string,
    endDate: Date | string
  ): string {
    let returnStr = '';
    const diff = DateTimeUtil.getPositiveTimeDiff(startDate, endDate);
    if (diff) {
      if (!!diff.years) {
        returnStr += diff.years + `${diff.years === 1 ? ' year' : ' years'}`;
      }
      if (!!diff.months) {
        returnStr += ' ' + diff.months + ' months';
      }
      if (!!diff.weeks) {
        returnStr += ' ' + diff.weeks + ' weeks';
      }
      if (!!diff.days) {
        returnStr += ' ' + diff.days + ' days';
      }
    }
    return returnStr;
  }
}
