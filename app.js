const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// dotenv - load first
dotenv.config();

// App
const app = express();

// CORS Middleware - Allow all origins (wildcard)
// Note: credentials must be false when using wildcard origin
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Authorization'],
  optionsSuccessStatus: 200,
  maxAge: 86400
}));

// OPTIONS requests are handled by CORS middleware above

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

// Load mongoose and configure it
const mongoose = require('mongoose');
const dbConnect = require('./config/db.js');
const errorHandler = require('./middleware/errorMiddleware.js');

// Load routes
const authRoutes = require("./routes/authRoute.js");
const eventRoutes = require("./routes/eventRoutes.js");
const orderRoutes = require("./routes/orderRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");

// Start DB connection in background (non-blocking)
// Mongoose will buffer commands until connection is ready
if (process.env.MONGOURI) {
  dbConnect().catch(() => {
    // Connection will happen when models are used
  });
}

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