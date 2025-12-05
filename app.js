const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const dbConnect = require('./config/db.js');
const errorHandler = require('./middleware/errorMiddleware.js');

const authRoutes = require("./routes/authRoute.js");
const eventRoutes = require("./routes/eventRoutes.js");
const orderRoutes = require("./routes/orderRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");

// dotenv
dotenv.config();

// App
const app = express();

// Middlewares
app.use(cors());

// Root route - immediate response (no DB, no middleware)
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Museum Ticket API is running',
    version: '1.0.0'
  });
});

// Health check endpoint (no DB required)
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Database connection middleware - truly non-blocking for serverless
let connectionPromise = null;

// Initialize connection in background (non-blocking) - only on first request
const initDBConnection = () => {
  // Don't connect if already connected or connecting
  if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
    return connectionPromise || Promise.resolve();
  }

  // Don't create new promise if one already exists
  if (connectionPromise) {
    return connectionPromise;
  }

  // Start connection in background (non-blocking)
  connectionPromise = dbConnect()
    .then(() => {
      console.log('DB connection established');
    })
    .catch(err => {
      console.error('Database connection error:', err.message);
      connectionPromise = null; // Reset to allow retry after delay
    });

  return connectionPromise;
};

const connectDB = (req, res, next) => {
  // Skip DB connection for health check - immediate response
  if (req.path === '/api/health') {
    return next();
  }

  // If already connected, proceed immediately
  if (mongoose.connection.readyState === 1) {
    return next();
  }

  // Start connection in background (non-blocking)
  // Don't wait for it - just start it and continue
  initDBConnection();
  
  // Continue immediately without waiting for connection
  next();
};

// Use DB connection middleware for all routes
app.use(connectDB);

// Stripe webhook needs raw body - capture it before JSON parsing
app.use('/api/orders/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Error Handler (must be after routes)
app.use(errorHandler);

module.exports = app;