const serverless = require('serverless-http');

// Lazy load handler - cached after first load
// Pre-loading causes timeout on cold start, so we lazy load instead
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
  // Set CORS headers for ALL responses FIRST
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // Handle OPTIONS preflight requests IMMEDIATELY
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
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

  // For API routes, lazy load and use handler
  try {
    const handler = getHandler();
    return await handler(req, res);
  } catch (error) {
    console.error('Error in handler:', error);
    return res.status(500).json({
      success: false,
      error: 'Server initialization failed',
      message: error.message
    });
  }
};