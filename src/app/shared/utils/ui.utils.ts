import {DateTimeUtil} from './date-time.util';

export class UiUtils {
  static keydownPreventDecimal($event: any): void {
    if ($event.key === '.' || $event.key === ',') {
      $event.preventDefault();
    }
  }

  static toMinTimespanText(
    startDate: Date | string,
    endDate: Date | string): string {
    let returnStr = '';
    const diff = DateTimeUtil.getTimeDiff(startDate, endDate);
    if (diff && diff.days) {
      const ymd = DateTimeUtil.toYMDValue(diff.days);
      if (!!ymd.years) {
        returnStr += ymd.years + ' years';
      }
      if (!!ymd.months) {
        returnStr += ' ' + ymd.months + ' months';
      }
      if (!!ymd.weeks) {
        returnStr += ' ' + ymd.weeks + ' weeks';
      }
      if (!!ymd.days) {
        returnStr += ' ' + ymd.days + ' days';
      }
    }
    return returnStr;
  }

}
