import { Schema, model, Document } from 'mongoose';

export interface IApplication extends Document {
  propertyId: string;
  userId?: string;
  applicantName: string;
  applicantEmail: string;
  nationalId: string;
  monthlyIncome: number;
  documentName?: string;
  status: string;
}

const applicationSchema = new Schema<IApplication>({
  propertyId: { type: String, required: true },
  userId: { type: String, default: '' },
  applicantName: { type: String, required: true, trim: true },
  applicantEmail: { type: String, required: true, trim: true },
  nationalId: { type: String, required: true, trim: true },
  monthlyIncome: { type: Number, required: true },
  documentName: { type: String, default: '' },
  status: { type: String, default: 'pending' }
}, {
  timestamps: true
});

export const Application = model<IApplication>('Application', applicationSchema);