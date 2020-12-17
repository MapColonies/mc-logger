import { LeveledLogMethod, Logger, LogMethod } from 'winston';
import { FileTransportOptions, HttpTransportOptions } from 'winston/lib/winston/transports';


export interface ILoggerConfig {
  level: string;
  log2console?: boolean;
  log2file?: FileTransportOptions;
  log2httpServer?: HttpTransportOptions;
}

export interface IServiceConfig {
  name: string;
  version: string;
}

export declare class MCLogger {
  constructor(config: ILoggerConfig, service: IServiceConfig);
  log: LogMethod;
  originalWinstonLogger: Logger;

  error: LeveledLogMethod;
  warn: LeveledLogMethod;
  info: LeveledLogMethod;
  http: LeveledLogMethod;
  verbose: LeveledLogMethod;
  debug: LeveledLogMethod;
  silly: LeveledLogMethod;
}
