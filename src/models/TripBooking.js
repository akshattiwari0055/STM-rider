import mongoose, { Schema } from 'mongoose';

const tripBookingSchema = new Schema({
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerName: { type: String, required: true },
  customerEmail: { type: String, default: null },
  phone: { type: String, required: true },
  numberOfSeats: { type: Number, required: true, default: 1, min: 1 },
  departureDate: { type: String, required: true },
  pickupPoint: { type: String, default: 'LPU Law Gate' },
  totalPrice: { type: Number, required: true },
  originalPrice: { type: Number },
  couponCode: { type: String, default: null },
  idCardImage: { type: String },
  aadhaarCardImage: { type: String },
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'], 
    default: 'Pending' 
  },
  notes: { type: String },
  razorpayOrderId: { type: String, default: null },
  razorpayPaymentId: { type: String, default: null },
}, { timestamps: true });

export const TripBooking = mongoose.models.TripBooking || mongoose.model('TripBooking', tripBookingSchema);
