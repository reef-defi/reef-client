export class DateTimeUtil {
  private static _MS_PER_DAY = 1000 * 60 * 60 * 24;

  // if end is lower than start returns 0
  public static getTimeDiff(startDate: Date | string, endDate: Date | string)
    : { days: number, hours: number, minutes: number, seconds: number } {
    if (typeof startDate === 'string') {
      let sNr = parseInt(startDate);
      startDate = new Date(isNaN(sNr) ? startDate : sNr);
    }
    if (typeof endDate === 'string') {
      let eNr = parseInt(endDate);
      endDate = new Date(isNaN(eNr) ? endDate : eNr);
    }
    const diff = endDate.getTime() - startDate.getTime();

    if (isNaN(diff) || diff < 0) {
      return null;
    }
    const diffDate = new Date(diff);
    const diffDays = Math.floor(diff / this._MS_PER_DAY);
    return {days: diffDays, hours: diffDate.getHours(), minutes: diffDate.getMinutes(), seconds: diffDate.getSeconds()};
  }

  static toDate(dateVal: number | string): Date {
    if (typeof dateVal === 'string' && !isNaN(parseInt(dateVal))) {
      dateVal = parseInt(dateVal, 10);
    }
    return new Date(dateVal);
  }
}
