'use strict';

const winston = require('winston');

function convertToBoolean(value) {
  return typeof value === 'string' ? value === 'true' : value;
}

function validateHttpConfig(httpOptions) {
  if(!httpOptions.hasOwnProperty('host')) {
    throw new Error('The property host is omitted from config option log2httpServer. Please fill this field or remove the property.');
  }
}

function generateConsoleTransport(service) {
  return new winston.transports.Console({
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
  });
}

function generateFileTransport(level) {
  const path = require('path');
  return new winston.transports.File({
    name: `${level}-file`,
    filename: path.resolve(`./logs/filelog-${level}.log`),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    level: level
  });
}

function generateHttpTransport(serverLogConfig) {
  return new winston.transports.Http(serverLogConfig);
}

module.exports.MCLogger = class MCLogger extends winston.Logger {
  constructor(config, service) {

    if(!service) {
      throw new Error('Config is required.');
    }
    if(!config) {
      throw new Error('Config is required.');
    }
    if(!config.level) {
      throw new Error('Level property is required in config.');
    }

    const params = {
      level: config.level || 'debug',
      name: service.name,
      transports: []
    };

    const consoleLog = convertToBoolean(config.log2console);
    const fileLog = convertToBoolean(config.log2file);
    const serverLogConfig = config.log2httpServer;

    if(consoleLog) {
      params.transports.push(generateConsoleTransport(service));
    }

    if (fileLog) {
      const path = require('path');
      const fs = require('fs');

      const logDir = path.resolve('./logs');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir);
      }

      params.transports.push(generateFileTransport('info'));
      params.transports.push(generateFileTransport('error'));
    }

    if(serverLogConfig) {
      // validate server log config option
      validateHttpConfig(serverLogConfig);
      params.transports.push(generateHttpTransport(serverLogConfig));
    }

    // check if transports array is empty
    if(!params.transports.length) {
      console.warn('No configuration was provided, adding default console logger.');
      params.transports.push(generateConsoleTransport(service));
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
