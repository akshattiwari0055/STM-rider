import mongoose, { Schema } from 'mongoose';

const itineraryDaySchema = new Schema({
  day: { type: Number, required: true },
  title: { type: String, required: true },
  details: { type: String, required: true },
}, { _id: false });

const tripSchema = new Schema({
  title: { type: String, required: true },
  destination: { type: String, required: true },
  price: { type: Number, required: true }, // e.g. 3499 per person
  originalPrice: { type: Number }, // e.g. 4999 (strikethrough)
  duration: { type: String, required: true }, // e.g. "3 Days / 2 Nights"
  departureDates: { type: [String], default: [] }, // e.g. ["Every Friday", "25 Oct 2026", "02 Nov 2026"]
  pickupLocation: { type: String, default: 'LPU Law Gate / Chandigarh' },
  dropLocation: { type: String, default: 'LPU Law Gate / Chandigarh' },
  seatsTotal: { type: Number, default: 20 },
  seatsAvailable: { type: Number, default: 20 },
  image: { type: String, required: true },
  images: { type: [String], default: [] },
  description: { type: String, required: true },
  itinerary: { type: [itineraryDaySchema], default: [] },
  inclusions: { type: [String], default: [] },
  exclusions: { type: [String], default: [] },
  thingsToCarry: { type: [String], default: [] },
  cancellationPolicy: { type: [String], default: [] },
  termsAndConditions: { type: [String], default: [] },
  status: { 
    type: String, 
    enum: ['Open', 'Filling Fast', 'Sold Out', 'Completed'], 
    default: 'Open' 
  },
  featured: { type: Boolean, default: true },
}, { timestamps: true });

export const Trip = mongoose.models.Trip || mongoose.model('Trip', tripSchema);
