
// database.js
const mongoose = require("mongoose");
require("dotenv").config();

// Database connection function
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URL);

    console.log(`MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error("Database Connection Failed");
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;


