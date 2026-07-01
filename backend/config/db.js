const mongoose = require('mongoose');

const connectDB = async () => {
  const atlasUri = process.env.MONGO_URI;

  if (!atlasUri || atlasUri.includes('<username>') || atlasUri.includes('<password>')) {
    console.error('❌ MONGO_URI is missing or contains placeholder values.');
    console.error('   Please set a valid MongoDB Atlas connection string in your .env file.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(atlasUri, {
      serverSelectionTimeoutMS: 10000, // Timeout after 10s if cluster is unreachable
    });
    console.log(`✅ MongoDB Connected (Atlas Cluster): ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ MongoDB Atlas connection failed: ${err.message}`);
    console.error('   Check your MONGO_URI, credentials, and IP whitelist on MongoDB Atlas.');
    process.exit(1);
  }
};

module.exports = connectDB;
