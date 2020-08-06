'use strict';

const winston = require('winston');
const path = require('path');
const fs = require('fs');

module.exports.MCLogger = class MCLogger extends winston.Logger {
  constructor(config, service) {
    const params = {
      level: config.level || 'debug',
      name: service.name,
      transports: [
        new winston.transports.Console({
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
        })
      ]
    };

    const fileTransports =
      typeof config.log2file === 'string'
        ? config.log2file === 'true'
        : config.log2file;
    if (fileTransports) {
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
