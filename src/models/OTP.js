import mongoose, { Schema, models } from 'mongoose';

const otpSchema = new Schema({
  email: { type: String, required: true },
  name: { type: String },
  password: { type: String },
  purpose: { type: String, enum: ['register', 'login'], required: true },
  userId: { type: String, default: null },
  code: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 } // Auto-delete after 10 mins
});

if (mongoose.models.OTP) delete mongoose.models.OTP;

export const OTP = mongoose.model('OTP', otpSchema);
