// conversation/controllers/messagesController.js

require('module-alias/register');
const config = require('@root/config');
const fs = require('fs');
const path = require('path');
const db = require('@root/db');
const agent = require('@root/agent');

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
  const quotes = process.env.QUOTES.quotes;
  return quotes[getRandomInt(quotes.length)];
};

const getRandomVideo = () => {
  const videos = process.env.VIDEOS.videos;
  return videos[getRandomInt(videos.length)];
};

const getRandomMeme = () => {
  const memes = process.env.MEMES.memes;
  return memes[getRandomInt(memes.length)];
};

const rejectInvalidPostMessagesRequests = (req, res) => {
  if (req.body.query == null || req.body.deviceId == null) {
    console.error('Required parameter(s) undefined.');
    return res.status(400).json({
      error: 'Invalid request: required parameter(s) are undefined.',
    });
  }
};

const postMessages = async (req, res) => {
  try {
    rejectInvalidPostMessagesRequests(req, res);
    const {query: userMessage, deviceId} = req.body;
    await db.saveUserMessage(userMessage, deviceId);
    const responseBlob = await agent.query(userMessage, config.projectId);
    const intent = getIntentFromBlob(responseBlob);
    let agentMessage = getMessageFromBlob(responseBlob);
    if (intent.displayName === 'memes') {
      let meme = getRandomMeme();
      await db.saveAgentImageMessage(meme.image, deviceId);
      return res.status(200).json({meme: meme});
    } else if (intent.displayName === 'videos') {
      let video = getRandomVideo();
      await db.saveAgentVideoMessage(video.title, video.url, deviceId);
      return res.status(200).json({message: `${video.title}\n${video.url}`});
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
  const avatar = process.env.AGENT_AVATAR_URL;
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
        avatar: doc.data().from === config.projectId ? avatar : '',
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
