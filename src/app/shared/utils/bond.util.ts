import {Bond, BondTimes} from '../../core/models/types';
import { DateTimeUtil } from './date-time.util';

export class BondUtil {
  private static MILLIS_PER_YEAR = 1000 * 60 * 60 * 24 * 365;

  static getBondReturn(
    bond: Bond,
    bondTimes: BondTimes,
    amountInvested: string
  ): { currentInterestReturn: number; totalInterestReturn: number } {
    const now = new Date().getTime();
    const { farmStartTime, farmEndTime, farmTimeSpan } = this.getBondFarmTime(
      bondTimes
    );
    const relativeYearlyFarmDuration = farmTimeSpan / BondUtil.MILLIS_PER_YEAR;
    const yearlyReturnTotal =
      (parseFloat(bond.apy) / 100) * parseFloat(amountInvested);
    const farmReturnTotal = yearlyReturnTotal * relativeYearlyFarmDuration;
    const farmRelTimeElapsed =
      now < farmEndTime ? (now - farmStartTime) / farmTimeSpan : 1;
    const currentEarnedReturn = farmReturnTotal * farmRelTimeElapsed;
    return {
      currentInterestReturn: currentEarnedReturn,
      totalInterestReturn: farmReturnTotal,
    };
  }

  private static getBondFarmTime(bondTimes: BondTimes) {
    const farmStartTime = DateTimeUtil.toDate(bondTimes.farmStartTime).getTime();
    const farmEndTime = DateTimeUtil.toDate(bondTimes.farmEndTime).getTime();
    const farmTimeSpan = farmEndTime - farmStartTime;
    return { farmStartTime, farmEndTime, farmTimeSpan };
  }
}
