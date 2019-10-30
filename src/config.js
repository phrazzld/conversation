// conversation/src/config.js

const bunyan = require('bunyan');

module.exports = {
  appName: process.env.APP_NAME || 'anon',
  projectId:
    process.env.APP_ENV === 'PROD'
      ? process.env.PROD_PROJECT_ID
      : process.env.TEST_PROJECT_ID,
  port: process.env.PORT || 8080,
  loggers: {
    dev: () => bunyan.createLogger({name: 'dev', level: 'debug'}),
    prod: () => bunyan.createLogger({name: 'prod', level: 'info'}),
    test: () => bunyan.createLogger({name: 'test', level: 'fatal'}),
  },
};
