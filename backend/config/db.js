const express = require("express");
const app = express();
const mongoose = require("mongoose");

const connectDB = async () => {
  const PORT = process.env.PORT || 5000;
  const URI = process.env.MONGO_URI;
  try {
      await mongoose.connect(URI);
      console.log("Connected to the database!");
  } catch (error) {
      console.log(`Error: ${error.message}`);
      process.exit(1); 
  }
};

module.exports = connectDB;
