// robopeterson-api/test/proctor.js
//
// Without requirements or design,
// programming is the art of adding bugs to an empty text file.

require('module-alias/register');
const expect = require('chai').expect;
const config = require('@root/config');
const log = config.loggers.test();

const check = err => {
  if (err) {
    log.fatal(err);
    expect(err).to.be.null;
  }
};

module.exports = {
  check,
};
