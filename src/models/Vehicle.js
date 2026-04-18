import mongoose, { Schema, models } from 'mongoose';

const tieredPriceSchema = new Schema({
  hours: { type: Number, required: true },
  price: { type: Number, required: true },
}, { _id: false });

const vehicleSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true, enum: ['Car', 'Bike', 'Scooty'] },
  pricePerDay: { type: Number, required: true }, // kept as starting/min price for display
  tieredPricing: { type: [tieredPriceSchema], default: [] },
  image: { type: String, required: true },
  status: { type: String, required: true, enum: ['Available', 'Busy', 'Under Maintenance'], default: 'Available' },
}, { timestamps: true });

export const Vehicle = models.Vehicle || mongoose.model('Vehicle', vehicleSchema);
