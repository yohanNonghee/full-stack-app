import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nationalId: { type: String, required: true },
  monthlyIncome: { type: Number, required: true },
  role: { type: String, enum: ['renter', 'admin'], default: 'renter' }
}, { timestamps: true });

export const User = model('User', userSchema);