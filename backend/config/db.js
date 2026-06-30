const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('❌ Error: MONGO_URI is not defined in the environment variables.');
    process.exit(1);
  }

  // Check if URI contains placeholder values
  if (uri.includes('<username>') || uri.includes('<password>')) {
    console.error('❌ Error: MONGO_URI in .env contains placeholder values. Please configure your actual MongoDB Atlas connection string.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB Atlas: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
