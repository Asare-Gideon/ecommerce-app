const mongoose = require("mongoose");

const connectDB = async (url) => {
  try {
    if (!url) {
      throw new Error("Missing MongoDB connection string.");
    }

    mongoose.set("bufferCommands", false);
    const connected = await mongoose.connect(url, {
      serverSelectionTimeoutMS: 10000,
    });
    if (connected) console.log("CONNECTED TO DATABASE");
    return connected;
  } catch (err) {
    console.error("DATABASE CONNECTION FAILED", err.message);
    throw err;
  }
};

module.exports = { connectDB };
