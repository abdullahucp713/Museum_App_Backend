const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
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

// DB Connection - connect to database
dbConnect();

// Middlewares
app.use(cors());

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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

module.exports = app;
