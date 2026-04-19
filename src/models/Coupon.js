import mongoose, { Schema, models } from 'mongoose';

const couponSchema = new Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountPercentage: { type: Number, required: true, min: 1, max: 100 },
  usageLimit: { type: Number, required: true, default: 1 },
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Always delete the cached model so schema changes take effect on hot-reload
if (mongoose.models.Coupon) delete mongoose.models.Coupon;

export const Coupon = mongoose.model('Coupon', couponSchema);
