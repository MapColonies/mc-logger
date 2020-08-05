import { LogCallback, LoggerInstance, Logger } from "winston";
interface LogMethod {
  (level: string, msg: string, callback: LogCallback): LoggerInstance;
  (level: string, msg: string, meta: any, callback: LogCallback): LoggerInstance;
  (level: string, msg: string, ...meta: any[]): LoggerInstance;
  (level: string, msg: string, span?: unknown): LoggerInstance;
}

export interface LoggerConfig {
  level: string;
  log2file?: boolean;
}

export interface ServiceConfig {
  name: string;
  version: string;
}

export declare class MCLogger extends Logger {
  constructor(config: LoggerConfig, service: ServiceConfig);
  log: LogMethod;
}
