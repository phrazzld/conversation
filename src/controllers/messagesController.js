// robopeterson-api/controllers/messagesController.js

require('module-alias/register');
const config = require('@root/config');
const fs = require('fs');
const path = require('path');
const db = require('@root/db');
const robopeterson = require('@root/agent');

const getMessageFromBlob = blob => {
  return blob.queryResult.fulfillmentText;
};

const getIntentFromBlob = blob => {
  return blob.queryResult.intent;
};

const handleEndpointError = (res, err) => {
  console.error('Error:', err);
  return res.status(500).json({error: err});
};

const getRandomInt = max => {
  return Math.floor(Math.random() * Math.floor(max));
};

const getRandomQuote = () => {
  const quotesPath = path.join(__dirname, '..', 'quotes.json');
  const quotes = JSON.parse(fs.readFileSync(quotesPath, 'utf8')).quotes;
  const i = getRandomInt(quotes.length);
  return quotes[i];
};

const rejectInvalidPostMessagesRequests = (req, res) => {
  if (req.body.query == null || req.body.deviceId == null) {
    console.error('Required parameter(s) undefined.');
    return res.status(400).json({
      error: 'Invalid request: required parameter(s) are undefined.',
    });
  }
};

const getRandomMeme = snapshot => {
  let memes = [];
  snapshot.forEach(meme => {
    memes.push({id: meme.id, data: meme.data()});
  });
  return memes[getRandomInt(memes.length)];
};

const postMessages = async (req, res) => {
  try {
    rejectInvalidPostMessagesRequests(req, res);
    const {query: userMessage, deviceId} = req.body;
    await db.saveUserMessage(userMessage, deviceId);
    const responseBlob = await robopeterson.query(
      config.robopetersonProjectId,
      userMessage,
    );
    const intent = getIntentFromBlob(responseBlob);
    let agentMessage = getMessageFromBlob(responseBlob);
    if (intent.displayName === 'memes') {
      const snapshot = await db.getMemes();
      if (snapshot.empty) {
        agentMessage = getRandomQuote();
      } else {
        let meme = getRandomMeme(snapshot);
        return res.status(200).json({meme: meme});
      }
    } else if (intent.isFallback) {
      agentMessage = getRandomQuote();
    }
    await db.saveAgentMessage(agentMessage, deviceId);
    return res.status(200).json({message: agentMessage});
  } catch (err) {
    return handleEndpointError(res, err);
  }
};

const rejectInvalidGetMessagesRequests = (req, res) => {
  if (req.params.deviceId == null) {
    console.error('Required parameter(s) undefined.');
    return res.status(400).json({
      error: 'Invalid request: required parameter(s) are undefined.',
    });
  }
};

const getMessages = async (req, res) => {
  try {
    rejectInvalidGetMessagesRequests(req, res);
    const snapshot = await db.getMessages(req.params.deviceId);
    if (snapshot.empty) {
      console.log('No matching documents');
      return res.status(204).json({});
    } else {
      let messages = [];
      snapshot.forEach(doc => {
        messages.push({id: doc.id, data: doc.data()});
      });
      return res.status(200).json(messages);
    }
  } catch (err) {
    return handleEndpointError(res, err);
  }
};

module.exports = {
  postMessages,
  getMessages,
};
