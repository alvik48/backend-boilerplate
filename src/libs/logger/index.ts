import winston, { Logger as WinstonLoggerSpec } from 'winston';

import { COLORS, LEVELS } from './constants';
import { LoggerOptionsSpec, LoggerSpec, LogLevel } from './interfaces';

export { LoggerOptionsSpec, LoggerSpec, LogLevel };

/**
 * Logger service class
 */
export default class Logger implements LoggerSpec {
  private logger: WinstonLoggerSpec;

  /**
   * Logger constructor
   * @param options
   * @param options.level - min level to display in console
   * @param options.sentryDSN - if provided, then FATAL errors will also be pushed into the Sentry service
   * @param options.version - package version
   */
  constructor(options: LoggerOptionsSpec) {
    const formatter = winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      winston.format.splat(),
      winston.format.printf((info) => {
        const { timestamp, level, message } = info;

        return `${timestamp} [${level}]: ${message}`;
      }),
    );

    let transport;

    if (options.file) {
      transport = new winston.transports.File({
        filename: options.file,
        maxsize: 104857600,
        maxFiles: 5,
        tailable: true,
        format: formatter,
      });
    } else {
      transport = new winston.transports.Console({
        format: winston.format.combine(winston.format.colorize(), formatter),
      });

      winston.addColors(COLORS);
    }

    this.logger = winston.createLogger({
      level: options.level || LogLevel.Info,
      levels: LEVELS,
      transports: [transport],
    });
  }

  /**
   * Transforms array of messages to a log string
   * @param msg
   */
  private static transform(msg: any[]) {
    let ret;

    try {
      ret = msg.map((message: any) => {
        if (typeof message === 'object') {
          if (message.stack) {
            return message.stack.toString();
          }

          return JSON.stringify(message, null, 2);
        }

        return message;
      });
    } catch (e) {
      ret = msg;
    }

    return ret.join(' ');
  }

  /**
   * Logs message(s) with "trace" level.
   * Use it to deep debug the application in development mode.
   * @param msg
   */
  trace(...msg: any) {
    this.log(LogLevel.Trace, msg);
  }

  /**
   * Logs message(s) with "debug" level.
   * Use it for messages in development mode.
   * @param msg
   */
  debug(...msg: any) {
    this.log(LogLevel.Debug, msg);
  }

  /**
   * Logs message(s) with "info" level.
   * Use it for common messages.
   * @param msg
   */
  info(...msg: any) {
    this.log(LogLevel.Info, msg);
  }

  /**
   * Logs message(s) with "warn" level.
   * Use it to mention that something goes unplanned but can be ignored for a while.
   * @param msg
   */
  warn(...msg: any) {
    this.log(LogLevel.Warn, msg);
  }

  /**
   * Logs message(s) with "error" level.
   * Use it if this error needs to be fixed but doesn't crash anything.
   * @param msg
   */
  error(...msg: any) {
    this.log(LogLevel.Error, msg);
  }

  /**
   * Logs message(s) with "fatal" level.
   * This message will be sent to the Sentry service if configured.
   * Use it if this error is critical and needs to be fixed ASAP.
   * @param msg
   */
  fatal(...msg: any) {
    this.log(LogLevel.Fatal, msg, true);
  }

  /**
   * Logs messages with given level
   * @param level - error level
   * @param msg - array of messages
   * @param notify - if true, then sends the error to the Sentry service
   */
  private log(level: LogLevel, msg: any[], notify = false) {
    const transformedMessage = Logger.transform(msg);
    this.logger.log(level, transformedMessage);

    if (notify) {
      // You can implement any notification service like Telegram/Slack here
    }
  }
}
