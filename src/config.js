// robopeterson-api/src/config.js

const bunyan = require('bunyan');

module.exports = {
  robopetersonProjectId: 'robopeterson-95686',
  port: process.env.PORT || 8080,
  loggers: {
    dev: () => bunyan.createLogger({name: 'dev', level: 'debug'}),
    prod: () => bunyan.createLogger({name: 'prod', level: 'info'}),
    test: () => bunyan.createLogger({name: 'test', level: 'fatal'}),
  },
};
