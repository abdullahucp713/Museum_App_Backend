const serverless = require('serverless-http');

// Pre-load app at module level (will be loaded once when function cold starts)
let app;
let handler;

try {
  app = require('../app.js');
  handler = serverless(app, {
    binary: ['image/*', 'application/pdf']
  });
} catch (error) {
  console.error('Failed to load app:', error);
  // Create minimal error app as fallback
  const express = require('express');
  const errorApp = express();
  errorApp.use((req, res) => {
    res.status(500).json({
      success: false,
      error: 'Server initialization failed',
      message: error.message
    });
  });
  handler = serverless(errorApp);
}

// Export handler
module.exports = handler;