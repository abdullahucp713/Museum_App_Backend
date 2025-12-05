const serverless = require('serverless-http');

// Initialize app with error handling
let app;
try {
  app = require('../app.js');
} catch (error) {
  console.error('Failed to load app:', error);
  // Create a minimal error app
  const express = require('express');
  app = express();
  app.use((req, res) => {
    res.status(500).json({
      success: false,
      error: 'Server initialization failed. Please check logs.',
      message: error.message
    });
  });
}

// Export the serverless handler for Vercel
module.exports = serverless(app, {
  binary: ['image/*', 'application/pdf']
});

