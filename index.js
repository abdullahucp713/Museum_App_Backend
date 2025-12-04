const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const dbConnect = require('./config/db.js');
const errorHandler = require('./middleware/errorMiddleware.js');
const serverless = require('serverless-http');

const authRoutes = require("./routes/authRoute.js");
const eventRoutes = require("./routes/eventRoutes.js");
const orderRoutes = require("./routes/orderRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js")

// dotenv
dotenv.config();

// PORT
const PORT = process.env.PORT || 4000;

// App
const app = express();

// DB Connnection
dbConnect();

// Middlewares
app.use(cors());

// Stripe webhook needs raw body - capture it before JSON parsing
app.use('/orders/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Error Handler (must be after routes)
// app.use(errorHandler);
// app.listen(PORT, () => {
//     console.log(`Server is listening at port ${PORT}`)
// });

module.exports.handler = serverless(app);
