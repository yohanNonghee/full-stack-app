import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb+srv://admin:password@cluster.mongodb.net/leiguhus?retryWrites=true&w=majority';
    await mongoose.connect(connStr);
    console.log('✅ MongoDB Atlas connected successfully to DB: leiguhus');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  }
};