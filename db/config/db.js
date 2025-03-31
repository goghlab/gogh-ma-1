const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// 加载环境变量，使用绝对路径
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables. Please check your .env file.');
    }
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    });
    
    console.log('MongoDB connected successfully!');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.error('Full error details:', JSON.stringify(error, null, 2));
    return false;
  }
};

module.exports = connectDB; 