const mongoose = require('mongoose');

// Cache the connection to reuse in serverless environments
let cachedConnection = null;

const dbConnect = async () => {
  if (!process.env.MONGOURI) {
    throw new Error("MONGOURI environment variable is not set.");
  }

  // If connection already exists and is connected, reuse it
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    // Close existing connection if it exists but is not ready
    if (cachedConnection) {
      await mongoose.connection.close();
    }

    // Set connection options for serverless
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(process.env.MONGOURI, options);
    console.log("MongoDB connected successfully!");
    
    cachedConnection = mongoose.connection;
    return cachedConnection;
  } catch (error) {
    console.error("MongoDB connection is failed:", error.message);
    throw error;
  }
};

module.exports = dbConnect;
