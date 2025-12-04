const mongoose = require('mongoose');

const dbConnect = async () => {
  if (!process.env.MONGOURI) {
    throw new Error("MONGOURI environment variable is not set.");
  }

  try {
    await mongoose.connect(process.env.MONGOURI);
    console.log("MongoDB connected successfully!");
    return true;
  } catch (error) {
    console.error("MongoDB connection is failed:", error.message);
    throw error;
  }
};

module.exports = dbConnect;
