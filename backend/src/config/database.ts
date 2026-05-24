import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) throw new Error('MONGODB_URI is not defined');

    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    console.error('\n⚠️  Please update MONGODB_URI in backend/.env with your MongoDB Atlas connection string.');
    console.error('   Get a free cluster at https://www.mongodb.com/atlas\n');
    // Don't exit — let server run so other errors are visible
  }
};
