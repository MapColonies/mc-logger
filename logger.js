'use strict';

const { createLogger, format, transports } = require('winston');

function convertToBoolean(value) {
    return typeof value === 'string' ? value === 'true' : value;
}

function validateHttpConfig(httpOptions) {
    if (!httpOptions.hasOwnProperty('host')) {
        throw new Error('The property host is omitted from config option log2httpServer. Please fill this field or remove the property.');
    }
}

function generateFileTransport(level) {
    const path = require('path');
    return new transports.File({
        filename: `filelog-${level}.log`,
        dirname: path.resolve(`./logs`),
        maxsize: 5242880, // 5MB
        tailable: true
    });
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

        const consoleLog = convertToBoolean(config.log2console);
        const fileLog = convertToBoolean(config.log2file);
        const serverLogConfig = config.log2httpServer;

        if (consoleLog) {
            params.transports.push(new transports.Console());
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

        if (serverLogConfig) {
            // validate server log config option
            validateHttpConfig(serverLogConfig);
            const httpTransport = generateHttpTransport(serverLogConfig);
            params.transports.push(httpTransport);
        }

        // check if transports array is empty
        if (!params.transports.length) {
            console.warn('No configuration was provided, adding default console logger.');
            params.transports.push(new transports.Console());
        }

        this.originalWinstonLogger = createLogger({
            level: params.level,
            format: format.combine(
                format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss'
                }),
                // todo: return when new winston npm version is released (merged to master)
                //  issue: https://github.com/winstonjs/winston/issues/1724
                //  fix: https://github.com/winstonjs/logform/pull/106
                // format.errors({ stack: true }),
                format.splat(),
                format.json()
            ),
            defaultMeta: { service: params.name, version: params.version },
            transports: params.transports
        });
    }

    // log
    log(level, message) {
        this.originalWinstonLogger.log(level, message);
    }

    log(level, message, callback) {
        this.originalWinstonLogger.log(level, message, callback);
    }

    log(level, message, meta, callback) {
        this.originalWinstonLogger.log(level, message, meta, callback);
    }

    log(level, message, ...meta) {
        this.originalWinstonLogger.log(level, message, meta);
    }

    log(entry) {
        this.originalWinstonLogger.log(entry);
    }

    // error
    error(message, callback) {
        this.originalWinstonLogger.error(message, callback);
    }

    error(message, meta, callback) {
        this.originalWinstonLogger.error(message, meta, callback);
    }

    error(message, ...meta){
        this.originalWinstonLogger.error(message, ...meta);
    }

    error(message){
        this.originalWinstonLogger.error(messag);
    }

    error(infoObject){
        this.originalWinstonLogger.error(infoObject);
    }

    // warn
    warn(message, callback) {
        this.originalWinstonLogger.warn(message, callback);
    }

    warn(message, meta, callback) {
        this.originalWinstonLogger.warn(message, meta, callback);
    }
    warn(message, ...meta){
        this.originalWinstonLogger.warn(message, ...meta);
    }

    warn(message){
        this.originalWinstonLogger.warn(messag);
    }

    warn(infoObject){
        this.originalWinstonLogger.warn(infoObject);
    }

    // info
    info(message, callback) {
        this.originalWinstonLogger.info(message, callback);
    }

    info(message, meta, callback) {
        this.originalWinstonLogger.info(message, meta, callback);
    }

    info(message, ...meta){
        this.originalWinstonLogger.info(message, ...meta);
    }

    info(message){
        this.originalWinstonLogger.info(messag);
    }

    info(infoObject){
        this.originalWinstonLogger.info(infoObject);
    }

    // http
    http(message, callback) {
        this.originalWinstonLogger.http(message, callback);
    }

    http(message, meta, callback) {
        this.originalWinstonLogger.http(message, meta, callback);
    }

    http(message, ...meta){
        this.originalWinstonLogger.http(message, ...meta);
    }

    http(message){
        this.originalWinstonLogger.http(messag);
    }

    http(infoObject){
        this.originalWinstonLogger.http(infoObject);
    }

    // verbose
    verbose(message, callback) {
        this.originalWinstonLogger.verbose(message, callback);
    }

    verbose(message, meta, callback) {
        this.originalWinstonLogger.verbose(message, meta, callback);
    }

    verbose(message, ...meta){
        this.originalWinstonLogger.verbose(message, ...meta);
    }

    verbose(message){
        this.originalWinstonLogger.verbose(messag);
    }

    verbose(infoObject){
        this.originalWinstonLogger.verbose(infoObject);
    }

    // debug
    debug(message, callback) {
        this.originalWinstonLogger.debug(message, callback);
    }

    debug(message, meta, callback) {
        this.originalWinstonLogger.debug(message, meta, callback);
    }

    debug(message, ...meta){
        this.originalWinstonLogger.debug(message, ...meta);
    }

    debug(message){
        this.originalWinstonLogger.debug(messag);
    }

    debug(infoObject){
        this.originalWinstonLogger.debug(infoObject);
    }

    // silly;
    silly(message, callback) {
        this.originalWinstonLogger.silly(message, callback);
    }

    silly(message, meta, callback) {
        this.originalWinstonLogger.silly(message, meta, callback);
    }

    silly(message, ...meta){
        this.originalWinstonLogger.silly(message, ...meta);
    }

    silly(message){
        this.originalWinstonLogger.silly(messag);
    }

    silly(infoObject){
        this.originalWinstonLogger.silly(infoObject);
    }
};
