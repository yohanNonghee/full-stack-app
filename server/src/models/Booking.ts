import { Schema, model, Document } from 'mongoose';

export interface IBooking extends Document {
  listingId: string;
  userId: string;
  totalAmount: number;
  documentUrl: string;
  status: string;
}

const BookingSchema = new Schema<IBooking>({
  listingId: { type: String, required: true },
  userId: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  documentUrl: { type: String, required: false }, // Prevent empty file scenarios.
  status: { type: String, default: 'Pending' },
}, { timestamps: true });

export const BookingModel = model<IBooking>('Booking', BookingSchema);