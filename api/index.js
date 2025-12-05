const serverless = require('serverless-http');

// Lazy load handler - cached after first load
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
module.exports = async (req, res) => {
  const path = req.url || req.path || '';
  
  // Handle health checks immediately without loading app
  if (path === '/' || path === '/api/health') {
    // Set CORS headers for health checks
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    return res.status(200).json({
      status: 'OK',
      message: path === '/' ? 'Museum Ticket API is running' : 'Server is running',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  }

  // For API routes, lazy load and use handler
  // The Express app will handle CORS via its middleware
  try {
    const handler = getHandler();
    return handler(req, res);
  } catch (error) {
    console.error('Error in handler:', error);
    // Set CORS headers even for errors
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    
    return res.status(500).json({
      success: false,
      error: 'Server initialization failed',
      message: error.message
    });
  }
};