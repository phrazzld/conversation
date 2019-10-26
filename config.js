module.exports = {
  robopetersonProjectId: 'robopeterson-95686',
  port: process.env.PORT || 8080,
  mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/robopeterson',
  mongoTestUrl: 'mongodb://localhost:27017/robopeterson-test',
};
