const serverless = require('serverless-http');
const app = require('../app.js');

// Export the serverless handler for Vercel
module.exports = serverless(app);

