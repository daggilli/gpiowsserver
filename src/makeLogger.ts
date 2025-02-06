'use strict';
import { Logger, createLogger, transports, LoggerOptions, format } from 'winston';
import { LoggerConfig } from './interfaces.js';

export const makeLogger = (config: LoggerConfig): Logger | undefined => {
  let logger: Logger | undefined = undefined;

  if (!(Object.hasOwn(config, 'useConsole') || Object.hasOwn(config, 'useFile'))) {
    return logger;
  }

  const logOptions: LoggerOptions = {
    transports: [],
    format: format.combine(format.timestamp(), format.json()),
  };

  if (Object.hasOwn(config, 'useConsole')) {
    const level = config.useConsole?.level;
    // this will always be the case; keep type checker happy
    if (Array.isArray(logOptions.transports)) {
      logOptions.transports?.push(new transports.Console({ level }));
    } else {
      logOptions.transports = new transports.Console({ level });
    }
  }

  if (Object.hasOwn(config, 'useFile')) {
    const { level, logfilePath } = config.useFile!;
    const fileOptions = {
      level,
      filename: logfilePath,
    };
    if (Array.isArray(logOptions.transports)) {
      logOptions.transports?.push(new transports.File(fileOptions));
    } else {
      logOptions.transports = new transports.File(fileOptions);
    }
  }

  logger = createLogger(logOptions);

  return logger;
};
