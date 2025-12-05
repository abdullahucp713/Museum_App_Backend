const serverless = require('serverless-http');

// Try to load app with error handling
let app;
try {
  app = require('../app.js');
} catch (error) {
  console.error('Failed to load app:', error);
  // Create minimal error app
  const express = require('express');
  app = express();
  app.use((req, res) => {
    res.status(500).json({
      success: false,
      error: 'Server initialization failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
    });
  });
}

// Export serverless handler
module.exports = serverless(app, {
  binary: ['image/*', 'application/pdf']
});