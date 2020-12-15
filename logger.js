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

    createLogMethods() {
        const logMethodType = ["log", "error", "warn", "info", "debug"];
        logMethodType.forEach(methodName => {
            this[methodName] = this.originalWinstonLogger[methodName].bind(this.originalWinstonLogger);
        });
    }
};
