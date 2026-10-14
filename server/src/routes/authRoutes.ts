import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'leiguhus_secret_key';

// Register User Endpoint
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, fullName, email, password, nationalId, monthlyIncome, role } = req.body as {
      name?: string;
      fullName?: string;
      email?: string;
      password?: string;
      nationalId?: string;
      monthlyIncome?: number;
      role?: string;
    };

    const userName = fullName || name;

    if (!userName || !email || !password) {
      return res.status(400).json({ message: 'All required fields must be filled.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email address is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      fullName: userName, 
      email: normalizedEmail,
      password: hashedPassword,
      nationalId: nationalId || '',
      monthlyIncome: monthlyIncome || 0,
      role: role || 'renter'
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      token,
      user: {
        id: newUser._id.toString(),
        name: (newUser as any).fullName, 
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err: any) {
    console.error('REGISTER ERROR:', err);
    return res.status(500).json({ message: err.message || 'Internal server error.' });
  }
});

// Login User Endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    let isMatch = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = password === user.password;
    }

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      token,
      user: {
        id: user._id.toString(),
        name: (user as any).fullName || (user as any).name, 
        role: user.role
      }
    });
  } catch (err: any) {
    console.error('LOGIN ERROR:', err);
    return res.status(500).json({ message: err.message || 'Internal server error.' });
  }
});

export default router;