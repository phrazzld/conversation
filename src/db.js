// robopeterson-api/db.js

require('module-alias/register');
const config = require('@root/config');
const Firestore = require('@google-cloud/firestore');

const db = new Firestore({
  projectId: config.robopetersonProjectId,
  keyFilename: process.env.GCP_KEY_FILE,
});

const handleDbError = (err, message) => {
  console.error(`${message}:\n${err}`);
  throw new Error(`${message}:\n${err}`);
};

const getMessages = async deviceId => {
  console.log('db.getMessages | deviceId:', deviceId);
  return db
    .collection('messages')
    .where('device', '==', deviceId)
    .orderBy('createdAt')
    .get();
};

const saveUserMessage = async (userMessage, deviceId) => {
  const now = new Date();
  try {
    const messageRef = await db.collection('messages').add({
      message: userMessage,
      device: deviceId,
      from: deviceId,
      to: config.robopetersonProjectId,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`Saved incoming message (id: ${messageRef.id})`);
  } catch (err) {
    handleDbError(err, 'Problem saving user message');
  }
};

const saveAgentMessage = async (agentMessage, deviceId) => {
  const now = new Date();
  try {
    const messageRef = await db.collection('messages').add({
      message: agentMessage,
      device: deviceId,
      from: config.robopetersonProjectId,
      to: deviceId,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`Saved outgoing message (id: ${messageRef.id})`);
  } catch (err) {
    handleDbError(err, 'Problem saving robopeterson message');
  }
};

module.exports = {
  saveAgentMessage,
  saveUserMessage,
  getMessages,
};
