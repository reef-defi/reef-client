export class DateTimeUtil {
  private static _MS_PER_DAY = 1000 * 60 * 60 * 24;

  // if end is lower than start returns 0
  public static getTimeDiff(
    startDate: Date | string,
    endDate: Date | string
  ): { days: number; hours: number; minutes: number; seconds: number } {
    startDate = DateTimeUtil.toDate(startDate);
    endDate = DateTimeUtil.toDate(endDate);
    const diff = endDate.getTime() - startDate.getTime();

    if (isNaN(diff) || diff < 0) {
      return null;
    }
    const diffDate = new Date(diff);
    const diffDays = Math.floor(diff / this._MS_PER_DAY);
    return {
      days: diffDays,
      hours: diffDate.getHours(),
      minutes: diffDate.getMinutes(),
      seconds: diffDate.getSeconds(),
    };
  }

  static toYMDValue(daysParam: number): { years: number, months: number, weeks: number, days: number } {
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
      years, months, weeks, days
    };
  }

  static toDate(dateVal: number | string | Date): Date {
    if (dateVal instanceof Date) {
      return dateVal;
    }
    if (typeof dateVal === 'string' && !isNaN(parseInt(dateVal, 10))) {
      dateVal = parseInt(dateVal, 10);
    }
    return new Date(dateVal);
  }
}
