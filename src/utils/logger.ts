import Logger, { LogLevel } from '../libs/logger';

const logger = new Logger({
  level: process.env.LOG_LEVEL as LogLevel,
  file: process.env.LOG_FILE,
});

export default logger;
