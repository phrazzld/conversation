// robopeterson-api/agent.js

require('module-alias/register');
const config = require('@root/config');
const dialogflow = require('dialogflow');
const uuid = require('uuid');

const generateSessionId = () => {
  return uuid.v4();
};

const generateDialogflowRequest = (query, languageCode, formattedSession) => {
  console.log(
    `generateDialogflowRequest({\n\ttext: ${query},\n\tlanguageCode: ${languageCode},\n\tformattedSession: ${formattedSession}\n})`,
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

// TODO: Right now every fresh query to the agent generates and uses a new session.
// It should not.
const query = async (projectId = config.robopetersonProjectId, query) => {
  const client = new dialogflow.v2.SessionsClient();
  const formattedSession = generateNewSession(client, projectId);
  const request = generateDialogflowRequest(query, 'en-US', formattedSession);
  const responses = await client.detectIntent(request);
  const response = responses[0];
  return response;
};

module.exports = {
  query,
};
