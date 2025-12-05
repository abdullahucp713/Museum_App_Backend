const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// dotenv - load first
dotenv.config();

// App
const app = express();

// Middlewares
app.use(cors());

// IMPORTANT: Register health check routes FIRST, before loading any heavy dependencies
// Root route - immediate response
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Museum Ticket API is running',
    version: '1.0.0'
  });
});

// Health check endpoint - completely independent
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Now load routes and middleware (after health check routes are registered)
const mongoose = require('mongoose');
const dbConnect = require('./config/db.js');
const errorHandler = require('./middleware/errorMiddleware.js');

const authRoutes = require("./routes/authRoute.js");
const eventRoutes = require("./routes/eventRoutes.js");
const orderRoutes = require("./routes/orderRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");

// Database connection middleware - truly non-blocking
let connectionPromise = null;

const initDBConnection = () => {
  if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
    return;
  }

  if (connectionPromise) {
    return;
  }

  // Start connection in background - don't wait
  connectionPromise = dbConnect()
    .then(() => {
      console.log('DB connection established');
    })
    .catch(err => {
      console.error('Database connection error:', err.message);
      connectionPromise = null;
    });
};

const connectDB = (req, res, next) => {
  // Skip for health check and root - they already responded
  if (req.path === '/api/health' || req.path === '/') {
    return next();
  }

  // If already connected, proceed
  if (mongoose.connection.readyState === 1) {
    return next();
  }

  // Start connection in background - don't wait
  initDBConnection();
  
  // Continue immediately
  next();
};

// DB middleware (will be skipped for health check)
app.use(connectDB);

// Stripe webhook needs raw body - before JSON parsing
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