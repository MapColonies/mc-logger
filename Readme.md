# Map-Colonies logger
> build on top of winston logger
## Install

```
$ npm install --save mc-logger
```

## Usage

```js
const { MCLogger } = require("@map-colonies/mc-logger");
const service = require("./package.json");

const config ={
    level:'info',
    log2file: true
}

const logger = new MCLogger(config,service);

logger.info('logger is logging');
```
