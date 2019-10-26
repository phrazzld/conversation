// robopeterson-api/controllers/messagesController.js

require('module-alias/register');
const config = require('@root/config');
const db = require('@root/db');
const robopeterson = require('@root/agent');

const getMessageFromBlob = blob => {
  return blob.queryResult.fulfillmentText;
};

const handleEndpointError = (res, err) => {
  console.error('Error:', err);
  res.status(500).json({error: err});
};

const postMessages = async (req, res) => {
  try {
    const userMessage = req.body.query;
    const deviceId = req.body.deviceId;
    await db.saveUserMessage(userMessage, deviceId);
    const responseBlob = await robopeterson.query(
      config.robopetersonProjectId,
      userMessage,
    );
    const agentMessage = getMessageFromBlob(responseBlob);
    await db.saveAgentMessage(agentMessage, deviceId);
    res.status(200).json({message: agentMessage});
  } catch (err) {
    handleEndpointError(res, err);
    //console.error('Error:', err);
    //res.status(500).json({error: err});
  }
};

const getMessages = async (req, res) => {
  try {
    const snapshot = await db.getMessages(req.params.deviceId);
    if (snapshot.empty) {
      console.log('No matching documents');
      res.status(204).json({});
    } else {
      let messages = [];
      snapshot.forEach(doc => {
        messages.push({id: doc.id, data: doc.data()});
      });
      res.status(200).json(messages);
    }
  } catch (err) {
    handleEndpointError(res, err);
    //console.error('Error:', err)
    //res.status(500).json({error: err})
  }
};

module.exports = {
  postMessages,
  getMessages,
};
