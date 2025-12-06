const mongoose = require('mongoose');

// Configure mongoose globally for serverless - enable command buffering
mongoose.set('bufferCommands', true);

let connectionPromise = null;

const dbConnect = async () => {
  if (!process.env.MONGOURI) {
    console.error("MONGOURI environment variable is not set.");
    return null;
  }

  // If already connected, return connection immediately
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If connection is in progress, return that promise
  if (connectionPromise) {
    return connectionPromise;
  }

  // Connection options optimized for Vercel serverless - ULTRA FAST
  const options = {
    maxPoolSize: 1, // Minimal pool for serverless
    serverSelectionTimeoutMS: 1000, // Very fast timeout (1 second)
    socketTimeoutMS: 45000,
    connectTimeoutMS: 1000, // Very fast timeout (1 second)
    heartbeatFrequencyMS: 10000,
    bufferCommands: true, // Mongoose will buffer commands
    retryWrites: true,
    w: 'majority'
  };

  // Start connection and cache promise - completely non-blocking
  connectionPromise = mongoose.connect(process.env.MONGOURI, options)
    .then(() => {
      console.log("MongoDB connected successfully!");
      return mongoose.connection;
    })
    .catch(error => {
      console.error("MongoDB connection failed:", error.message);
      connectionPromise = null; // Reset to allow retry
      // Don't throw - let mongoose buffer commands
      return null;
    });

  return connectionPromise;
};

module.exports = dbConnect;
