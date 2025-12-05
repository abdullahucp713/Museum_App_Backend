// Minimal handler - responds immediately, loads app lazily
module.exports = async (req, res) => {
  const path = req.url || req.path || '';
  
  // Handle health checks IMMEDIATELY - no dependencies loaded
  if (path === '/' || path === '/api/health') {
    return res.status(200).json({
      status: 'OK',
      message: path === '/' ? 'Museum Ticket API is running' : 'Server is running',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  }

  // For other routes, lazy load the full app
  try {
    const serverless = require('serverless-http');
    const app = require('../app.js');
    const handler = serverless(app, {
      binary: ['image/*', 'application/pdf']
    });
    return handler(req, res);
  } catch (error) {
    console.error('Error loading app:', error);
    return res.status(500).json({
      success: false,
      error: 'Server initialization failed',
      message: error.message
    });
  }
};