import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { Application } from '../models/Application.js';

const router = Router();

// 1. GET /api/applications - Retrieve all application entries.
router.get('/', async (_req: Request, res: Response) => {
  try {
    const applications = await Application.find().populate({
      path: 'propertyId',
      select: 'title location rent'
    });
    return res.status(200).json(applications);
  } catch (err: any) {
    console.error('GET APPLICATIONS ERROR:', err);
    return res.status(500).json({ message: err.message || 'Internal server error.' });
  }
});

// 2. POST /api/applications - Save new application and manage document files.
router.post('/', async (req: Request, res: Response) => {
  try {
    const { propertyId, userId, applicantName, applicantEmail, nationalId, monthlyIncome, documentName, documentBase64 } = req.body;

    if (!propertyId || !applicantName || !applicantEmail) {
      return res.status(400).json({ message: 'Required application fields are missing.' });
    }

    let savedDocumentName = '';
    if (documentBase64 && documentName) {
      const matches = documentBase64.match(/^data:(.+);base64,(.+)$/);
      const buffer = Buffer.from(matches ? matches[2] : documentBase64, 'base64');
      
      savedDocumentName = `doc-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(documentName) || '.pdf'}`;
      const uploadDir = path.join(process.cwd(), 'uploads');
      
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      fs.writeFileSync(path.join(uploadDir, savedDocumentName), buffer);
    }

    const newApplication = new Application({
      propertyId,
      userId: userId || null,
      applicantName,
      applicantEmail,
      nationalId,
      monthlyIncome,
      documentName: savedDocumentName,
      status: 'pending'
    });

    const savedApp = await newApplication.save();
    return res.status(201).json({ message: 'Application submitted successfully.', application: savedApp });
  } catch (err: any) {
    console.error('APPLICATION SUBMIT ERROR:', err);
    return res.status(500).json({ message: err.message || 'Internal server/database error.' });
  }
});

// 3. PUT /api/applications/:id/status - Update application status
router.put('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid application ID format.' });
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedApplication) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    return res.status(200).json({ message: 'Status updated successfully', application: updatedApplication });
  } catch (err: any) {
    console.error('UPDATE STATUS ERROR:', err);
    return res.status(500).json({ message: err.message || 'Internal server error.' });
  }
});

// 4. DELETE /api/applications/:id - Delete application by ID
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid application ID format.' });
    }

    const deletedApplication = await Application.findByIdAndDelete(id);

    if (!deletedApplication) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    return res.status(200).json({ message: 'Application deleted successfully.' });
  } catch (err: any) {
    console.error('DELETE ERROR:', err);
    return res.status(500).json({ message: err.message || 'Internal server error.' });
  }
});

export default router;