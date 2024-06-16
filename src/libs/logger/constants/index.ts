import { ConsoleColors, LogLevel } from '../interfaces';

const ERROR_LEVELS_SETTINGS = {
  [LogLevel.Trace]: { level: 5, color: ConsoleColors.White },
  [LogLevel.Debug]: { level: 4, color: ConsoleColors.Green },
  [LogLevel.Info]: { level: 3, color: ConsoleColors.Green },
  [LogLevel.Warn]: { level: 2, color: ConsoleColors.Yellow },
  [LogLevel.Error]: { level: 1, color: ConsoleColors.Red },
  [LogLevel.Fatal]: { level: 0, color: ConsoleColors.Red },
};

export const LEVELS = Object.entries(ERROR_LEVELS_SETTINGS).reduce((acc: Record<string, number>, [name, { level }]) => {
  acc[name] = level;
  return acc;
}, {});

export const COLORS = Object.entries(ERROR_LEVELS_SETTINGS).reduce((acc: Record<string, string>, [name, { color }]) => {
  acc[name] = color;
  return acc;
}, {});
