// robopeterson-api/server.js
// Client sends message
// Forward message to robopeterson
// Save client message and robopeterson response
// Rerender messages thread on client (initiated by client)

require('module-alias/register');
const express = require('express');
const app = express();
const config = require('@root/config');
const dialogflow = require('dialogflow');
const uuid = require('uuid');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');

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

const generateSessionId = () => {
  return uuid.v4();
};

const generateDialogflowRequest = (query, languageCode, formattedSession) => {
  console.log(
    `generateDialogflowRequest({ text: ${query}, languageCode: ${languageCode}, formattedSession: ${formattedSession} })`,
  );
  return {
    session: formattedSession,
    queryInput: {
      text: {
        text: query,
        languageCode: languageCode,
      },
    },
  };
};

const generateNewSession = (client, projectId) => {
  return client.sessionPath(projectId, generateSessionId());
};

const queryAgent = async (projectId = config.robopetersonProjectId, query) => {
  const client = new dialogflow.v2.SessionsClient();
  const formattedSession = generateNewSession(client, projectId);
  const request = generateDialogflowRequest(query, 'en-US', formattedSession);
  const responses = await client.detectIntent(request);
  const response = responses[0];
  return response;
};

const processIncomingMessage = async (req, res) => {
  console.log('Processing incoming message:');
  console.log(req);
  console.log('req.query:', req.query);
  console.log('req.query.query:', req.query.query);
  try {
    let message = await queryAgent(
      config.robopetersonProjectId,
      req.query.query,
    );
    res.status(200).json({blob: message});
  } catch (err) {
    console.error('err:', err);
    res.status(500).json({error: err});
  }
};

app.post('/api/message', processIncomingMessage);

app.listen(config.port, err => {
  if (err) {
    console.error(err);
  } else {
    console.log(`RoboPeterson operational, listening on port ${config.port}`);
  }
});
