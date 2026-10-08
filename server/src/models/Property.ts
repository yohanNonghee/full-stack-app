import { Schema, model, Document } from 'mongoose';

export interface IProperty extends Document {
  title: string;
  description: string;
  rent: number;
  utilities: number;
  address: string;
  neighborhood: string;
  size: number;
  bedrooms: number;
  lat: number;
  lng: number;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new Schema<IProperty>({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  rent: { type: Number, required: true, min: 0 },
  utilities: { type: Number, required: true, min: 0 },
  address: { type: String, required: true },
  neighborhood: { type: String, required: true },
  size: { type: Number, required: true, min: 0 },
  bedrooms: { type: Number, required: true, min: 0 },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  images: [{ type: String }],
}, { 
  timestamps: true 
});

export const PropertyModel = model<IProperty>('Property', PropertySchema);