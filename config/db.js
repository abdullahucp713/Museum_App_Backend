const mongoose = require('mongoose');

// Configure mongoose globally - enable command buffering
mongoose.set('bufferCommands', true);

let connectionPromise = null;

const dbConnect = async () => {
  if (!process.env.MONGOURI) {
    console.error("MONGOURI environment variable is not set.");
    throw new Error("MONGOURI environment variable is required");
  }

  // If already connected, return connection
  if (mongoose.connection.readyState === 1) {
    console.log("Using existing MongoDB connection");
    return mongoose.connection;
  }

  // If connection is in progress, return that promise
  if (connectionPromise) {
    return connectionPromise;
  }

  // Connection options optimized for production (Render uses traditional server)
  const options = {
    maxPoolSize: 10, // Larger pool for traditional server
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 5000,
    heartbeatFrequencyMS: 10000,
  };

  // Start connection and cache promise
  connectionPromise = mongoose.connect(process.env.MONGOURI, options)
    .then(() => {
      console.log("MongoDB connected successfully!");
      return mongoose.connection;
    })
    .catch(error => {
      console.error("MongoDB connection failed:", error.message);
      connectionPromise = null; // Reset to allow retry
      throw error;
    });

  return connectionPromise;
};

module.exports = dbConnect;
