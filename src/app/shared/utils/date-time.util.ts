export class DateTimeUtil {
  private static _MS_PER_DAY = 1000 * 60 * 60 * 24;

  // if end is lower than start returns 0
  public static getTimeDiff(
    startDate: Date | string,
    endDate: Date | string
  ): {
    years: number;
    months: number;
    weeks: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } {
    startDate = DateTimeUtil.toDate(startDate);
    endDate = DateTimeUtil.toDate(endDate);
    const diff = endDate.getTime() - startDate.getTime();

    if (isNaN(diff) || diff < 0) {
      return null;
    }
    const diffDays = Math.floor(diff / this._MS_PER_DAY);
    return {
      ...DateTimeUtil.toYMDValue(diffDays),
      ...DateTimeUtil.toHMSValue(diff),
    };
  }

  static toYMDValue(
    daysParam: number
  ): { years: number; months: number; weeks: number; days: number } {
    let months = 0;
    let years = 0;
    let days = 0;
    let weeks = 0;
    while (daysParam) {
      if (daysParam >= 365) {
        years++;
        daysParam -= 365;
      } else if (daysParam >= 30) {
        months++;
        daysParam -= 30;
      } else if (daysParam >= 7) {
        weeks++;
        daysParam -= 7;
      } else {
        days++;
        daysParam--;
      }
    }
    return {
      years,
      months,
      weeks,
      days,
    };
  }

  static toHMSValue(
    millis: number
  ): {
    hours: number;
    minutes: number;
    seconds: number;
  } {
    const second = 1000;
    const minute = second * 60;
    const hour = minute * 60;

    const hours = Math.floor((millis / hour) % 24);
    const minutes = Math.floor((millis / minute) % 60);
    const seconds = Math.floor((millis / second) % 60);

    return {
      hours,
      minutes,
      seconds,
    };
  }

  static toDate(dateVal: number | string | Date): Date {
    if (dateVal instanceof Date) {
      return dateVal;
    }
    console.log('toDate VVV=', dateVal);

    if (typeof dateVal === 'string' && dateVal.indexOf(':') < 0 && !isNaN(parseInt(dateVal, 10))) {
      dateVal = parseInt(dateVal, 10);
    }
    return new Date(dateVal);
  }
}
