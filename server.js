// robopeterson-api/server.js

const express = require('express');
const app = express();
const config = require('./config');

const dialogflow = require('dialogflow');
const uuid = require('uuid');

async function queryAgent(projectId = config.ROBOPETERSON_PROJECT_ID, query) {
  const sessionId = uuid.v4();
  const sessionClient = new dialogflow.SessionsClient();
  const sessionPath = sessionClient.sessionPath(projectId, sessionId);
  const langCode = 'en-US';
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
        languageCode: langCode,
      },
    },
  };
  const responses = await sessionClient.detectIntent(request);
  const response = responses[0].queryResult.fulfillmentText;
  return response;
}

app.post('/api/message', async (req, res) => {
  try {
    let message = await queryAgent(
      config.ROBOPETERSON_PROJECT_ID,
      req.query.query,
    );
    res.send(message);
  } catch (err) {
    console.log('err:', err);
    res.status(500).send(err);
  }
});

app.listen(config.PORT, () => {
  console.log(`RoboPeterson operational, listening on port ${config.PORT}`);
});
