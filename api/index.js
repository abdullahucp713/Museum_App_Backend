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
module.exports = (req, res) => {
  // CRITICAL: Handle OPTIONS FIRST - synchronous, no async/await
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.status(200).end();
    return;
  }
  
  // Set CORS headers for all other responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Max-Age', '86400');
  
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
  const handler = getHandler();
  return handler(req, res);
};