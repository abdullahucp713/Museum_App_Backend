const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// dotenv - load first
dotenv.config();

// App
const app = express();

// CORS Middleware - Allow all origins (wildcard)
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Authorization'],
  optionsSuccessStatus: 200,
  maxAge: 86400
}));

// Root route - immediate response
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Museum Ticket API is running',
    version: '1.0.0'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Load mongoose (lightweight) - configure it
const mongoose = require('mongoose');
mongoose.set('bufferCommands', true);

// Lazy load DB connection - don't connect until first DB request
const dbConnect = require('./config/db.js');

// Middleware to ensure DB connection for API routes (non-blocking)
app.use((req, res, next) => {
  // Skip DB connection for health checks
  if (req.path === '/' || req.path === '/api/health') {
    return next();
  }
  
  // Start DB connection in background if not connected (non-blocking)
  if (process.env.MONGOURI && mongoose.connection.readyState === 0) {
    dbConnect().catch(() => {
      // Mongoose will buffer commands until connection is ready
    });
  }
  
  next();
});

// Stripe webhook needs raw body - before JSON parsing
app.use('/api/orders/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Lazy load routes (load only when needed - but routes are needed for all API calls)
const authRoutes = require("./routes/authRoute.js");
const eventRoutes = require("./routes/eventRoutes.js");
const orderRoutes = require("./routes/orderRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Error Handler (must be after routes)
const errorHandler = require('./middleware/errorMiddleware.js');
app.use(errorHandler);

module.exports = app;
