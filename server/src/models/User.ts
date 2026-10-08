import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  idNumber: string;
  monthlyIncome: number;
  isVerified: boolean;
  isAdmin: boolean;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  idNumber: { type: String, required: true },
  monthlyIncome: { type: Number, required: true },
  isVerified: { type: Boolean, default: true },
  isAdmin: { type: Boolean, default: false },
}, { timestamps: true });

export const UserModel = model<IUser>('User', UserSchema);