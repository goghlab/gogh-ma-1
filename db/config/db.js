const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    
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