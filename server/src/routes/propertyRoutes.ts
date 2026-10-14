import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { Property } from '../models/Property';

const router = Router();

// Validate IDs without modifying them.
function isValidObjectId(id: string): boolean {
  return /^[a-fA-F0-9]{24}$/.test(id) &&
    mongoose.Types.ObjectId.isValid(id);
}

// GET /api/properties - Retrieve all properties, newest first.
router.get('/', async (_req: Request, res: Response) => {
  try {
    const properties = await Property.find().sort({ createdAt: -1 });
    return res.status(200).json(properties);
  } catch (error: unknown) {
    console.error('GET PROPERTIES ERROR:', error);
    return res.status(500).json({
      message: 'Failed to retrieve properties.',
    });
  }
});

// POST /api/properties - Create a property.
router.post('/', async (req: Request, res: Response) => {
  try {
    const newProperty = new Property(req.body);
    const savedProperty = await newProperty.save();
    return res.status(201).json(savedProperty);
  } catch (error: unknown) {
    console.error('CREATE PROPERTY ERROR:', error);
    const message =
      error instanceof Error ? error.message : 'Invalid property data.';
    return res.status(400).json({ message });
  }
});

// PUT /api/properties/:id - Update an existing property.
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id ?? '');
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: 'Invalid property ID format.',
      });
    }

    const updates = { ...req.body };
    delete updates._id;
    delete updates.id;

    const updatedProperty = await Property.findByIdAndUpdate(
      id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedProperty) {
      return res.status(404).json({
        message: 'Property not found.',
      });
    }

    return res.status(200).json(updatedProperty);
  } catch (error: unknown) {
    console.error('UPDATE PROPERTY ERROR:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to update property.';
    return res.status(400).json({ message });
  }
});

// DELETE /api/properties/:id - Delete a property.
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id ?? '');
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: 'Invalid property ID format.',
      });
    }

    const deletedProperty = await Property.findByIdAndDelete(id);
    if (!deletedProperty) {
      return res.status(404).json({
        message: 'Property not found.',
      });
    }

    return res.status(200).json({
      message: 'Property deleted successfully.',
    });
  } catch (error: unknown) {
    console.error('DELETE PROPERTY ERROR:', error);
    return res.status(500).json({
      message: 'Failed to delete property.',
    });
  }
});

export default router;