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
  return quotes[getRandomInt(quotes.length)];
};

const rejectInvalidPostMessagesRequests = (req, res) => {
  if (req.body.query == null || req.body.deviceId == null) {
    console.error('Required parameter(s) undefined.');
    return res.status(400).json({
      error: 'Invalid request: required parameter(s) are undefined.',
    });
  }
};

const getRandomMeme = () => {
  const memesPath = path.join(__dirname, '..', 'memes.json');
  const memes = JSON.parse(fs.readFileSync(memesPath, 'utf8')).memes;
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
      let meme = getRandomMeme();
      await db.saveAgentImageMessage(meme, deviceId);
      return res.status(200).json({meme: meme});
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

const formatMessages = snapshot => {
  let messages = [];
  const avatar = 'https://f4.bcbits.com/img/a2965037780_10.jpg';
  snapshot.forEach(doc => {
    messages.push({
      _id: doc.id,
      text: doc.data().message,
      image: doc.data().image,
      video: doc.data().video,
      createdAt: new Date(doc.data().createdAt.seconds * 1000),
      user: {
        _id: doc.data().from,
        name: doc.data().from,
        avatar: doc.data().from.indexOf('robopeterson' > -1) ? avatar : '',
      },
    });
  });
  return messages;
};

const getMessages = async (req, res) => {
  try {
    rejectInvalidGetMessagesRequests(req, res);
    const snapshot = await db.getMessages(req.params.deviceId);
    if (snapshot.empty) {
      console.log('No matching documents');
      return res.status(204).json({});
    } else {
      let messages = formatMessages(snapshot);
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
