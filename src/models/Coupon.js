import mongoose, { Schema } from 'mongoose';

const couponSchema = new Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountPercentage: { type: Number, required: true, min: 1, max: 100 },
  usageLimit: { type: Number, required: true, default: 1 },
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);
