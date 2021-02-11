import {DateTimeUtil} from './date-time.util';

export class UiUtils {
  static keydownPreventDecimal($event: any): void {
    if ($event.key === '.' || $event.key === ',') {
      $event.preventDefault();
    }
  }

  static toMinTimespanText(
    startDate: Date | string | number,
    endDate: Date | string | number
  ): string {
    let returnStr = '';

    const diff = DateTimeUtil.getPositiveTimeDiff(startDate, endDate);

    if (diff.months > 0 && diff.days === 30) {
      diff.months = diff.months + 1;
      diff.days = 0;
      diff.hours = 0;
      diff.minutes = 0;
      diff.seconds = 0;
    }

    if (diff) {
      if (!!diff.years) {
        returnStr += diff.years + `${diff.years === 1 ? ' year' : ' years'}`;
      }
      if (!!diff.months) {
        returnStr +=
          ' ' + diff.months + `${diff.months === 1 ? ' month' : ' months'}`;
      }
      if (!!diff.weeks) {
        returnStr +=
          ' ' + diff.weeks + `${diff.weeks === 1 ? ' week' : ' weeks'}`;
      }
      if (!!diff.days) {
        returnStr += ' ' + diff.days + `${diff.days === 1 ? ' day' : ' days'}`;
      }
      if (!!diff.hours) {
        returnStr +=
          ' ' + diff.hours + `${diff.hours === 1 ? ' hour' : ' hours'}`;
      }
    }
    return returnStr;
  }
}
