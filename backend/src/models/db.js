import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/arkaJainHackathon';
  await mongoose.connect(uri);
  console.log('MongoDB connected');
};

export default connectDB;
