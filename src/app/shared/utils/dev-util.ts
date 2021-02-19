import { environment } from '../../../environments/environment';

export class DevUtil {
  static devLog(
    msg: string,
    value?: any,
    logLevel: LogLevel = LogLevel.STD
  ): void {
    const minLogLevel = environment.logLevel;
    if (minLogLevel >= logLevel) {
      if (logLevel > LogLevel.WARNING) {
        console.log(msg, value);
      } else if (logLevel === LogLevel.WARNING) {
        console.warn(msg, value);
      } else if (logLevel === LogLevel.ERROR) {
        console.error(msg, value);
      }
    }
  }
}

export enum LogLevel {
  ERROR = -1,
  WARNING = 0,
  STD = 1,
}
