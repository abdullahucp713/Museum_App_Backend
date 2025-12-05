const serverless = require('serverless-http');

// Lazy load handler
let cachedHandler = null;

const getHandler = () => {
  if (cachedHandler) {
    return cachedHandler;
  }

  try {
    const app = require('../app.js');
    cachedHandler = serverless(app, {
      binary: ['image/*', 'application/pdf']
    });
    return cachedHandler;
  } catch (error) {
    console.error('Failed to load app:', error);
    throw error;
  }
};

// Export handler
module.exports = (req, res) => {
  const path = req.url || req.path || '';
  
  // Handle health checks immediately without loading app
  if (path === '/' || path === '/api/health') {
    return res.status(200).json({
      status: 'OK',
      message: path === '/' ? 'Museum Ticket API is running' : 'Server is running',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  }

  // For API routes, load and use handler
  try {
    const handler = getHandler();
    return handler(req, res);
  } catch (error) {
    console.error('Error in handler:', error);
    return res.status(500).json({
      success: false,
      error: 'Server initialization failed',
      message: error.message
    });
  }
};