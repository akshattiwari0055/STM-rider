import mongoose, { Schema, models } from 'mongoose';

const bookingSchema = new Schema({
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerEmail: { type: String, default: null },
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  idProof: { type: String }, // Legacy
  idCardImage: { type: String },
  aadhaarCardImage: { type: String },
  drivingLicenseImage: { type: String },
  startDate: { type: Date, required: true },     // pickup datetime
  endDate: { type: Date },                        // now also stored for overlap checks
  durationHours: { type: Number },               // NEW: 3 / 5 / 12 / 24
  totalPrice: { type: Number, required: true },
  originalPrice: { type: Number },
  couponCode: { type: String },
  status: { type: String, enum: ['Pending', 'Active', 'Completed', 'Cancelled'], default: 'Pending' },
  verificationPendingUntil: { type: Date, default: null },
  approvedAt: { type: Date, default: null },
  returnReminderLastSentAt: { type: Date, default: null },
  returnConfirmedAt: { type: Date, default: null },
  slotKey: { type: String, unique: true, sparse: true, default: null },
}, { timestamps: true });

// Always delete the cached model so schema changes take effect on hot-reload
if (mongoose.models.Booking) delete mongoose.models.Booking;

export const Booking = mongoose.model('Booking', bookingSchema);
