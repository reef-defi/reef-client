import {Duration, intervalToDuration, isAfter} from 'date-fns';

export class DateTimeUtil {

  public static getPositiveTimeDiff(
    startDate: Date | string,
    endDate: Date | string
  ): Duration {
    startDate = DateTimeUtil.toDate(startDate);
    endDate = DateTimeUtil.toDate(endDate);
    if (!isAfter(endDate, startDate)) {
      return null;
    }
    return intervalToDuration({start: startDate, end: endDate});
  }

  static toDate(dateVal: number | string | Date): Date {
    if (dateVal instanceof Date) {
      return dateVal;
    }

    if (
      typeof dateVal === 'string' &&
      dateVal.indexOf(':') < 0 &&
      !isNaN(parseInt(dateVal, 10))
    ) {
      dateVal = parseInt(dateVal, 10);
    }
    return new Date(dateVal);
  }
}
