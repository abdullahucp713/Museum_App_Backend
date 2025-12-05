const serverless = require('serverless-http');

// Pre-load app and handler at module level
// Vercel will cache this between invocations, making subsequent requests faster
let app;
let handler;

try {
  // Pre-load the app when the module is first loaded
  app = require('../app.js');
  handler = serverless(app, {
    binary: ['image/*', 'application/pdf']
  });
  console.log('App pre-loaded successfully');
} catch (error) {
  console.error('Failed to pre-load app:', error);
  // If pre-load fails, we'll lazy load on first request
  handler = null;
}

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
  
  // Handle health checks immediately without using handler
  if (path === '/' || path === '/api/health') {
    return res.status(200).json({
      status: 'OK',
      message: path === '/' ? 'Museum Ticket API is running' : 'Server is running',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  }

  // Use pre-loaded handler or lazy load if pre-load failed
  if (!handler) {
    try {
      app = require('../app.js');
      handler = serverless(app, {
        binary: ['image/*', 'application/pdf']
      });
    } catch (error) {
      console.error('Error loading app:', error);
      return res.status(500).json({
        success: false,
        error: 'Server initialization failed',
        message: error.message
      });
    }
  }

  try {
    return await handler(req, res);
  } catch (error) {
    console.error('Error in handler:', error);
    return res.status(500).json({
      success: false,
      error: 'Request handling failed',
      message: error.message
    });
  }
};