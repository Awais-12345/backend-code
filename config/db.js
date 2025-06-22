const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // More detailed error logging
    if (error.message.includes("bad auth")) {
      console.error("Authentication failed. Check your username and password.");
    }
    process.exit(1);
  }
};

module.exports = connectDB;
