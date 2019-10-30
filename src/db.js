// conversation/db.js

require('module-alias/register');
const config = require('@root/config');
const Firestore = require('@google-cloud/firestore');

const db = new Firestore({
  projectId: config.projectId,
  keyFilename: process.env.GCP_KEY_FILE,
});

const handleDbError = (err, message) => {
  console.error(`${message}:\n${err}`);
  throw new Error(`${message}:\n${err}`);
};

const getMessages = async deviceId => {
  try {
    return db
      .collection('messages')
      .where('device', '==', deviceId)
      .orderBy('createdAt', 'desc')
      .get();
  } catch (err) {
    handleDbError(err);
  }
};

const saveUserMessage = async (userMessage, deviceId) => {
  const now = new Date();
  try {
    const messageRef = await db.collection('messages').add({
      message: userMessage,
      device: deviceId,
      from: deviceId,
      to: config.projectId,
      createdAt: now,
      updatedAt: now,
    });
  } catch (err) {
    handleDbError(err, 'Problem saving user message');
  }
};

const saveAgentImageMessage = async (imageUrl, deviceId) => {
  const now = new Date();
  try {
    const messageRef = await db.collection('messages').add({
      image: imageUrl,
      device: deviceId,
      from: config.projectId,
      to: deviceId,
      createdAt: now,
      updatedAt: now,
    });
  } catch (err) {
    handleDbError(err, 'Problem saving agent image message');
  }
};

const saveAgentVideoMessage = async (videoTitle, videoUrl, deviceId) => {
  const now = new Date();
  try {
    const messageRef = await db.collection('messages').add({
      message: `${videoTitle}\n${videoUrl}`,
      device: deviceId,
      from: config.projectId,
      to: deviceId,
      createdAt: now,
      updatedAt: now,
    });
  } catch (err) {
    handleDbError(err, 'Problem saving agent video message');
  }
};

const saveAgentMessage = async (agentMessage, deviceId) => {
  const now = new Date();
  try {
    const messageRef = await db.collection('messages').add({
      message: agentMessage,
      device: deviceId,
      from: config.projectId,
      to: deviceId,
      createdAt: now,
      updatedAt: now,
    });
  } catch (err) {
    handleDbError(err, 'Problem saving agent message');
  }
};

module.exports = {
  saveAgentMessage,
  saveAgentImageMessage,
  saveAgentVideoMessage,
  saveUserMessage,
  getMessages,
};
