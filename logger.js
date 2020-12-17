'use strict';

const { createLogger, format, transports } = require('winston');

function convertToBoolean(value) {
  return typeof value === 'string' ? value === 'true' : value;
}

function validateHttpConfig(httpOptions) {
  if (!httpOptions.host) {
    console.warn('The property host is mandatory in config option log2httpServer. httpTransport won\'t be added.');
    return false;
  }
  return true;
}

function generateHttpTransport(serverLogConfig) {
  return new transports.Http(serverLogConfig);
}

module.exports.MCLogger = class MCLogger {
  constructor(config, service) {
    if (!service) {
      throw new Error('Config is required.');
    }
    if (!config) {
      throw new Error('Config is required.');
    }
    if (!config.level) {
      throw new Error('Level property is required in config.');
    }

    const params = {
      level: config.level || 'warn',
      name: service.name,
      version: service.version,
      transports: []
    };

    const transports = this.initializeTransports(config);
    params.transports = transports;

    const extraDataFormat = format(info => {
      info.service = params.name;
      info.version = params.version;
      return info;
    });

    this.originalWinstonLogger = createLogger({
      level: params.level,
      format: format.combine(
        format.timestamp(),
        // todo: return when new winston npm version is released (merged to master)
        //  issue: https://github.com/winstonjs/winston/issues/1724
        //  fix: https://github.com/winstonjs/logform/pull/106
        // format.errors({ stack: true }),
        format.splat(),
        extraDataFormat(),
        format.json()
      ),
      transports: params.transports
    });

    this.createLogMethods();
  }

  initializeTransports(config) {
    const loggerTransports = [];
    const consoleLog = convertToBoolean(config.log2console);
    const fileLog = Boolean(config.log2file);
    const serverLogConfig = config.log2httpServer;

    if (consoleLog) {
      loggerTransports.push(new transports.Console());
    }

    if (fileLog) {
      const fileTransport = this.getFileTransport(config.log2file);
      loggerTransports.push(fileTransport);
    }

    if (serverLogConfig && validateHttpConfig(serverLogConfig)) {
      const httpTransport = generateHttpTransport(serverLogConfig);
      loggerTransports.push(httpTransport);
    }

    // check if transports array is empty
    if (!loggerTransports.length) {
      console.warn('No configuration was provided, adding default console logger.');
      loggerTransports.push(new transports.Console());
    }
    return loggerTransports;
  }

  getFileTransport(fileLoggerConfig) {
    // we need this so we won't break the api
    if (fileLoggerConfig === true) {
      fileLoggerConfig = {};
    }
    fileLoggerConfig.filename = fileLoggerConfig.filename ? `${fileLoggerConfig.filename}.log` : 'filelog-.log';
    fileLoggerConfig.dirname = fileLoggerConfig.dirname ? fileLoggerConfig.dirname : './logs';
    fileLoggerConfig.maxsize = fileLoggerConfig.maxsize ? fileLoggerConfig.maxsize : 5242880; // 5MB;
    fileLoggerConfig.tailable = fileLoggerConfig.tailable ? fileLoggerConfig.tailable : true;
    return new transports.File(fileLoggerConfig);
  }

  createLogMethods() {
    const logMethodType = ['log', 'error', 'warn', 'info', 'debug'];
    logMethodType.forEach(methodName => {
      this[methodName] = this.originalWinstonLogger[methodName].bind(this.originalWinstonLogger);
    });
  }
};
