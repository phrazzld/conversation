// robopeterson-api/app.js

require('module-alias/register');
const express = require('express');
const app = express();
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const messagesController = require('@controllers/messagesController');

app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
    },
  }),
);
app.use(helmet.permittedCrossDomainPolicies());
app.use(
  helmet.featurePolicy({
    features: {
      vibrate: ["'none'"],
      payment: ["'none'"],
      syncXhr: ["'none'"],
      notifications: ["'none'"],
      microphone: ["'none'"],
      camera: ["'none'"],
      geolocation: ["'none'"],
    },
  }),
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser());

// Endpoint definitions
app.get('/api/messages/:deviceId', messagesController.getMessages);
app.post('/api/messages', messagesController.postMessages);

module.exports = app;
