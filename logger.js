'use strict';

let winston = require('winston');
let util = require('util');
let path = require('path');

module.exports = class MCLogger extends winston.Logger {

    constructor(config, service) {
        let params = {
            level: config.level || 'debug',
            name: service.name,
            transports: [new winston.transports.Console({
                timestamp: function () {
                    return new Date().toISOString();
                },
                json: false,
                formatter: function (options) {
                    let logMessage = util.format('[%s] [%s] [%s] [%s] %s', options.timestamp(), options.level, service.name, service.version, options.message);
                    if (options.meta && Object.keys(options.meta).length) {
                        logMessage += util.format(' [%j]', options.meta);
                    }
                    return logMessage;
                }
            })],
        };

        let file_transports = (typeof config.log2file === 'string') ? (config.log2file === 'true') : config.log2file;
        if (file_transports) {
            params.transports.push(new winston.transports.File({
                name: 'info-file',
                filename: path.resolve('./logs/filelog-info.log'),
                maxsize: 5242880, // 5MB
                maxFiles: 5,
                level: 'info'
            }));
            params.transports.push(new winston.transports.File({
                name: 'error-file',
                filename: path.resolve('./logs/filelog-error.log'),
                maxsize: 5242880, // 5MB
                maxFiles: 5,
                level: 'error'
            }));
        }

        super(params);
    }

    log(level, msg, span) {
        let args = Array.prototype.slice.call(arguments, 1);
        if (span) {
            if (span.constructor.name === "Span") {
                span.log({'level': level, 'message': msg});
                args = [msg];
            }
        }
        super.log(level, ...args);
    }
};
