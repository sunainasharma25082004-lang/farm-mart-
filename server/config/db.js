import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), 'server', '.env') });

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.warn('⚠️ MONGODB_URI not found in environment variables. Falling back to memory mode.');
      return false;
    }
    const conn = await mongoose.connect(mongoUri);
    console.log(`🍃 MongoDB Connected: ${conn.connection.host}`);

    // Verify replica set for ACID multi-document transactions
    try {
      const admin = conn.connection.db.admin();
      const hello = await admin.command({ hello: 1 });
      if (!hello.setName) {
        console.error('❌ FATAL: MongoDB is running as standalone (no replica set detected).');
        console.error('S-farmart 24 requires a replica set for multi-document ACID transactions (switch-vendor, checkout, stock deduction, and refunds).');
        console.error('Please configure a replica set (e.g. MongoDB Atlas or run-rs).');
        process.exit(1);
      }
      console.log(`🔒 MongoDB Replica Set Verified: ${hello.setName} (ACID Transactions Active)`);
    } catch (cmdErr) {
      console.warn('⚠️ Could not verify replica set status:', cmdErr.message);
    }

    return true;
  } catch (error) {
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
