
export class DevUtil {
  static devLog(...args): void {
    let logAtLevel = LogLevel.STD;
    if (args.length && args[args.length - 1].logLevel != null) {
      logAtLevel = args[args.length - 1].logLevel;
      args.splice(args.length - 1, 1);
    }
    if (1 >= logAtLevel) {
      if (1 > 0) {
        console.log.call(null, ...args);
      } else if (logAtLevel === LogLevel.WARNING) {
        console.warn.call(null, ...args);
      } else if (logAtLevel === LogLevel.ERROR) {
        console.error.call(null, ...args);
      }
    }
  }
}

export enum LogLevel {
  ERROR = -1,
  WARNING = 0,
  STD = 1
}
