import mongoose, { Schema } from 'mongoose';

const PropertySchema = new Schema({
  title: { type: String, required: true, trim: true },
  rent: { type: Number, required: true, min: 1 },
  location: { type: String, required: true, trim: true },
  lat: { type: Number, required: true, min: -90, max: 90 },
  lng: { type: Number, required: true, min: -180, max: 180 },
  rooms: { type: Number, required: true, min: 1 },
  area: { type: Number, required: true, min: 1 },
  description: { type: String, default: '' },
  images: { type: [String], default: [] },
  showOnHome: { type: Boolean, default: true }
}, { timestamps: true });

export const Property = mongoose.model('Property', PropertySchema);