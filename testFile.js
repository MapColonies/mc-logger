'use strict';

const { transports } = require('winston');

const { MCLogger } = require('./logger');
const service = require('./package.json');

const config = {
  level: 'debug',
  log2file: {
    level: 'debug',
    filename: 'testFile',
    dirname: 'testDir'
  }
};
const logger = new MCLogger(config, service);

logger.info('logger is logging');
logger.originalWinstonLogger.add(new transports.Console());
logger.info('logger is logging after adding console logger');
