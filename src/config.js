// robopeterson-api/src/config.js

const bunyan = require('bunyan');

module.exports = {
  robopetersonProjectId:
    process.env.ROBOPETERSON_ENV === 'PROD'
      ? 'robopeterson-95686'
      : 'robopeterson-test',
  port: process.env.PORT || 8080,
  loggers: {
    dev: () => bunyan.createLogger({name: 'dev', level: 'debug'}),
    prod: () => bunyan.createLogger({name: 'prod', level: 'info'}),
    test: () => bunyan.createLogger({name: 'test', level: 'fatal'}),
  },
};
