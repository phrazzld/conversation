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
const Firestore = require('@google-cloud/firestore');

const db = new Firestore({
  projectId: config.robopetersonProjectId,
  keyFilename: process.env.GCP_KEY_FILE,
});

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

const generateNewSession = (
  client,
  projectId = config.robopetersonProjectId,
) => {
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

const getMessageFromBlob = blob => {
  return blob.queryResult.fulfillmentText;
};

const saveUserMessage = async (userMessage, deviceId) => {
  const now = new Date();
  try {
    const messageRef = db.collection('messages').add({
      message: userMessage,
      from: deviceId,
      to: config.robopetersonProjectId,
      createdAt: now,
      updatedAt: now,
    });
    console.log(
      `Saved incoming message (id: ${messageRef.id}):\n"${userMessage}"\n\t(${deviceId})`,
    );
  } catch (err) {
    console.error(err);
    throw new Error('Error saving user message:', err);
  }
};

const saveRoboPetersonMessage = async (roboPetersonMessage, deviceId) => {
  const now = new Date();
  try {
    const messageRef = db.collection('messages').add({
      message: roboPetersonMessage,
      from: config.robopetersonProjectId,
      to: deviceId,
      createdAt: now,
      updatedAt: now,
    });
    console.log(
      `Saved outgoing message (id: ${messageRef.id}:\n"${roboPetersonMessage}"\n\tFrom: ${config.robopetersonProjectId}\n\tTo: ${deviceId})`,
    );
  } catch (err) {
    console.error(err);
    throw new Error('Error saving robopeterson message:', err);
  }
};

const processIncomingMessage = async (req, res) => {
  try {
    const userMessage = req.body.query;
    const deviceId = req.body.deviceId;
    await saveUserMessage(userMessage, deviceId);
    const responseBlob = await queryAgent(
      config.robopetersonProjectId,
      userMessage,
    );
    const message = getMessageFromBlob(responseBlob);
    let docRef = await db.collection('messages').add({
      deviceId: deviceId,
      message: message,
    });
    res.status(200).json({message: message});
  } catch (err) {
    console.error('Error:', err);
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
