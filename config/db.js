const mongoose = require('mongoose');

// Cache the connection to reuse in serverless environments
let cachedConnection = null;

const dbConnect = async () => {
  if (!process.env.MONGOURI) {
    console.error("MONGOURI environment variable is not set.");
    return null;
  }

  // If connection already exists and is connected, reuse it
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    // Set connection options for serverless
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      bufferMaxEntries: 0,
    };

    await mongoose.connect(process.env.MONGOURI, options);
    console.log("MongoDB connected successfully!");
    
    cachedConnection = mongoose.connection;
    return cachedConnection;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    // Don't throw - let the app continue and retry later
    return null;
  }
};

module.exports = dbConnect;
