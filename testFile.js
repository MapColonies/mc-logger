'use strict';

const { transports } = require('winston');

const { MCLogger } = require('./logger');
const service = require('./package.json');

const config = { level: 'info', log2file: true };
const logger = new MCLogger(config, service);

logger.info('logger is logging');
logger.originalWinstonLogger.add(new transports.Console());
logger.info('logger is logging after adding console logger');
