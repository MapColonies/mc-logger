'use strict';

const winston = require('winston');

function convertToBoolean(value) {
  return typeof value === 'string' ? value === 'true' : value;
}

function validateHttpConfig(httpOptions) {
  if(!httpOptions.hasOwnProperty('host')) {
    throw 'The property host is omitted from config option log2httpServer. Please fill this field or remove the option.'
  }
}

module.exports.MCLogger = class MCLogger extends winston.Logger {
  constructor(config, service) {
    const params = {
      level: config.level || 'debug',
      name: service.name,
      transports: []
    };

    const consoleLog = convertToBoolean(config.log2console);
    const fileTransports = convertToBoolean(config.log2file);
    const serverLog = config.log2httpServer;

    // check if the config has an option set that isn't 'level', or if log2console is present
    if(Object.keys(config).length === 1 || consoleLog) {
      params.transports.push(new winston.transports.Console({
        timestamp: function () {
          return new Date().toISOString();
        },
        json: false,
        formatter: function (options) {
          let logMessage = `[${options.timestamp()}] [${options.level}] [${service.name}] [${service.version}] ${options.message}`;
          if (options.meta && Object.keys(options.meta).length) {
            logMessage += ` [${JSON.stringify(options.meta)}]`;
          }
          return logMessage;
        }
      }));
    }

    if (fileTransports) {
      const path = require('path');
      const fs = require('fs');

      const logDir = path.resolve('./logs');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir);
      }

      params.transports.push(
        new winston.transports.File({
          name: 'info-file',
          filename: path.resolve('./logs/filelog-info.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 5,
          level: 'info'
        })
      );
      params.transports.push(
        new winston.transports.File({
          name: 'error-file',
          filename: path.resolve('./logs/filelog-error.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 5,
          level: 'error'
        })
      );
    }

    if(serverLog) {
      // validate server log config option
      validateHttpConfig(config.log2httpServer);
      params.transports.push(
        new winston.transports.Http(serverLog)
      );
    }

    super(params);
  }

  log(level, msg, span) {
    let args = Array.prototype.slice.call(arguments, 1);
    if (span) {
      if (span.constructor.name === 'Span') {
        span.log({ level: level, message: msg });
        args = [msg];
      }
    }
    super.log(level, ...args);
  }
};
