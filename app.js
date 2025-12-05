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

// Health check endpoint (no DB required)
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Database connection middleware - lazy connection for serverless
let isConnecting = false;
const connectDB = async (req, res, next) => {
  // Skip DB connection for health check
  if (req.path === '/api/health') {
    return next();
  }

  // Check if already connected
  if (mongoose.connection.readyState === 1) {
    return next();
  }

  // If connection is in progress, wait a bit or continue
  if (isConnecting) {
    return next();
  }

  // Try to connect (non-blocking)
  if (mongoose.connection.readyState === 0 && !isConnecting) {
    isConnecting = true;
    dbConnect()
      .then(() => {
        isConnecting = false;
      })
      .catch(err => {
        console.error('Database connection error:', err.message);
        isConnecting = false;
      });
  }
  
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