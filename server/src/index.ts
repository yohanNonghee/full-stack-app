import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { PropertyModel } from './models/Property';
import authRoutes from './routes/authRoutes';
import bookingRoutes from './routes/bookingRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || '';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Retrieve all property listings.
app.get('/api/properties', async (req: Request, res: Response) => {
  try {
    const properties = await PropertyModel.find();
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
});

// Add New House (For Admin)
app.post('/api/properties', async (req: Request, res: Response) => {
  try {
    const newProperty = new PropertyModel(req.body);
    const savedProperty = await newProperty.save();
    res.status(201).json({ message: 'Property created successfully', property: savedProperty });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save property', error: (error as Error).message });
  }
});

// (Edit Property)
app.put('/api/properties/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedProperty = await PropertyModel.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedProperty) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json({ message: 'Property updated successfully', property: updatedProperty });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update property', error: (error as Error).message });
  }
});

// (Delete Property)
app.delete('/api/properties/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedProperty = await PropertyModel.findByIdAndDelete(id);
    if (!deletedProperty) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete property', error: (error as Error).message });
  }
});

// Connect to MongoDB and run the server.
const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully.');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  } 
};

startServer();