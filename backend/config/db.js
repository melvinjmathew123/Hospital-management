const mongoose = require('mongoose');

const LOCAL_URI = 'mongodb://127.0.0.1:27017/hms';

const connectDB = async () => {
  const useLocal = process.env.USE_LOCAL_DB === 'true';
  const atlasUri = process.env.MONGO_URI;

  // ── Local MongoDB mode ──────────────────────────────────────────────────────
  if (useLocal) {
    try {
      const conn = await mongoose.connect(LOCAL_URI);
      console.log(`✅ MongoDB Connected (Local): ${conn.connection.host}`);
      return;
    } catch (err) {
      console.error(`❌ Local MongoDB connection failed: ${err.message}`);
      console.error('   Make sure MongoDB is running locally (mongod).');
      process.exit(1);
    }
  }

  // ── Atlas mode ──────────────────────────────────────────────────────────────
  if (!atlasUri || atlasUri.includes('<username>') || atlasUri.includes('<password>')) {
    console.error('❌ MONGO_URI is missing or contains placeholder values.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(atlasUri);
    console.log(`✅ MongoDB Connected (Atlas): ${conn.connection.host}`);
  } catch (atlasErr) {
    console.warn(`⚠️  Atlas connection failed: ${atlasErr.message}`);
    console.warn('   Falling back to local MongoDB (mongodb://127.0.0.1:27017/hms)...');
    try {
      const conn = await mongoose.connect(LOCAL_URI);
      console.log(`✅ MongoDB Connected (Local Fallback): ${conn.connection.host}`);
    } catch (localErr) {
      console.error(`❌ Local MongoDB fallback also failed: ${localErr.message}`);
      console.error('   Ensure MongoDB is installed and running, or fix your Atlas URI / IP whitelist.');
      process.exit(1);
    }
  }
};

module.exports = connectDB;
