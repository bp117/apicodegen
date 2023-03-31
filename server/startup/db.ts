const mongoose = require("mongoose");

const dbUri = process.env.MONGODB_URI;

const Logger = require("../lib/logger");

const connectDB = async () => {
  try {
    await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    Logger.info("MongoDB Connected...");
    return;
  } catch (err: unknown) {
    if (err instanceof Error) {
      Logger.error("MongoDB error --" + err.message);
      // Exit process with failure
      process.exit(1);
    }
  }
};

module.exports = connectDB;
