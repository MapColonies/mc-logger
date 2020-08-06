# Map-Colonies logger
> build on top of winston logger
## Install

```
$ npm install --save @map-colonies/mc-logger
```

## Usage

On node servers:
```js
const { MCLogger } = require("@map-colonies/mc-logger");
const service = require("./package.json");

const config = {
    level:'info',
    log2file: true
}

const logger = new MCLogger(config, service);

logger.info('logger is logging');
```

On client side:
```js
const { MCLogger } = require("@map-colonies/mc-logger");
const service = require("./package.json");

const config = {
    level:'info',
    log2httpServer: {
        host: '<hostname>',
        port: '<port>',
        path: '<path_on_server>',
    }
}

const logger = new MCLogger(config, service);

logger.info('logger is logging');
```

The config 'log2httpServer' option has the following fields:\
host: required\
port: optional, default is 80 or 443\
path: optional, default is '/'\
auth: optional, default is None\
ssl: optional, default is false