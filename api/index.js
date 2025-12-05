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
  // CRITICAL: Set CORS headers FIRST for ALL responses
  // This must happen before any other processing
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // Handle OPTIONS preflight requests IMMEDIATELY - before anything else
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
  // CORS middleware in app.js will also handle it
  try {
    const handler = getHandler();
    const result = await handler(req, res);
    
    // Ensure CORS headers are still set after handler execution
    if (!res.headersSent) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    }
    
    return result;
  } catch (error) {
    console.error('Error in handler:', error);
    return res.status(500).json({
      success: false,
      error: 'Server initialization failed',
      message: error.message
    });
  }
};