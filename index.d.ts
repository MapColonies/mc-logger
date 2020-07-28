import { LogCallback, LoggerInstance, Logger } from 'winston';
interface LogMethod {
  (level: string, msg: string, callback: LogCallback): LoggerInstance;
  (level: string, msg: string, meta: any, callback: LogCallback): LoggerInstance;
  (level: string, msg: string, ...meta: any[]): LoggerInstance;
  (level: string, msg: string, span?: unknown): LoggerInstance;
}

export declare class MCLogger extends Logger {
  constructor(config: unknown, service: unknown);
  log: LogMethod;
}
