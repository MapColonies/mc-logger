import { LogCallback, LoggerInstance, Logger } from 'winston';
interface ILogMethod {
  (level: string, msg: string, callback: LogCallback): LoggerInstance;
  (level: string, msg: string, meta: any, callback: LogCallback): LoggerInstance;
  (level: string, msg: string, ...meta: any[]): LoggerInstance;
  (level: string, msg: string, span?: unknown): LoggerInstance;
}

export interface ILoggerConfig {
  level: string;
  log2console?: boolean;
  log2file?: boolean;
  log2httpServer?: {
    host: string;
    port?: number;
    path?: string;
    auth?: unknown;
    ssl?: boolean;
  };
}

export interface IServiceConfig {
  name: string;
  version: string;
}

export declare class MCLogger extends Logger {
  constructor(config: ILoggerConfig, service: IServiceConfig);
  log: ILogMethod;
}
