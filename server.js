// robopeterson-api/server.js
// Client sends message
// Forward message to robopeterson
// Save client message and robopeterson response
// Rerender messages thread on client (initiated by client)

require('module-alias/register');
const app = require('@root/app');
const config = require('@root/config');

app.listen(config.port, err => {
  if (err) {
    console.error(err);
  } else {
    console.log(`RoboPeterson operational, listening on port ${config.port}`);
  }
});
