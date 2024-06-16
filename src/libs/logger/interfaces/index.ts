// -----------------------------------------------------------------------------
// Enums

export enum ConsoleColors {
  White = 'white',
  Green = 'green',
  Yellow = 'yellow',
  Red = 'red',
}

export enum LogLevel {
  Trace = 'trace',
  Debug = 'debug',
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
  Fatal = 'fatal',
}

// -----------------------------------------------------------------------------
// Interfaces

export interface LoggerOptionsSpec {
  level: LogLevel;
  file?: string;
}

export interface LoggerSpec {
  trace(...args: any[]): void;
  debug(...args: any[]): void;
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
  fatal(...args: any[]): void;
}
