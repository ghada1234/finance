import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Use MongoDB Atlas free tier or local MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/finance-saas';
    
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(mongoURI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log('');
    console.log('⚠️  URGENT: Your IP is NOT whitelisted in MongoDB Atlas!');
    console.log('');
    console.log('Fix this NOW:');
    console.log('1. Go to: https://cloud.mongodb.com');
    console.log('2. Click "Network Access" (left sidebar)');
    console.log('3. Click "ADD IP ADDRESS"');
    console.log('4. Enter: 0.0.0.0/0 (allows all IPs)');
    console.log('5. Click "Confirm"');
    console.log('6. Wait 1-2 minutes, then restart server');
    console.log('');
    // Don't exit - let the app continue without DB for now
  }
};

export default connectDB;

