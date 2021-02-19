import {environment} from '../../../environments/environment';

export class DevUtil {
  static devLog(msg: string, value: any, logLevel: LogLevel): void {
    if (environment.logLevel >= logLevel) {
      if (logLevel > 0) {
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
  STD = 1
}
