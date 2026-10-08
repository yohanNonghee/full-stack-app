import { Router, Request, Response } from 'express';
import { BookingModel } from '../models/Booking';
import multer from 'multer';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

router.post('/', upload.single('document'), async (req: Request, res: Response) => {
  console.log("--- Received Booking Request ---");
  console.log("req.body:", req.body);
  console.log("req.file:", req.file);

  try {
    //Maximum security protection; access directly via properties.
    const body = req.body ? req.body : {};
    const listingId = body.listingId;
    const userId = body.userId;
    const totalAmount = body.totalAmount;

    if (!listingId || !userId) {
      return res.status(400).json({ 
        message: 'Missing required fields (listingId or userId)',
        receivedBody: body 
      });
    }

    const documentUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const newBooking = new BookingModel({ 
      listingId, 
      userId, 
      totalAmount: Number(totalAmount) || 0, 
      documentUrl 
    });
    
    await newBooking.save();

    return res.status(201).json({ 
      message: 'Booking created successfully', 
      booking: newBooking 
    });
  } catch (err: any) {
    console.error("❌ Booking Error Detail:", err);
    return res.status(500).json({ 
      message: "Failed to create booking", 
      error: err.message || err.toString() 
    });
  }
});

export default router;