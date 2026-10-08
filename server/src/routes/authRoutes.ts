import { Router, Request, Response } from 'express';
import { UserModel } from '../models/User';

const router = Router();

// Register Route
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, idNumber, monthlyIncome, isVerified } = req.body;
    
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const newUser = new UserModel({
      name,
      email,
      password,
      idNumber,
      monthlyIncome,
      isVerified,
      isAdmin: false
    });

    const savedUser = await newUser.save();
    
    const token = 'mock-jwt-token-' + savedUser._id;

    res.status(201).json({
      token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        isVerified: savedUser.isVerified,
        isAdmin: savedUser.isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration', error: (error as Error).message });
  }
});

// Login Route
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = 'mock-jwt-token-' + user._id;

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error: (error as Error).message });
  }
});

export default router;