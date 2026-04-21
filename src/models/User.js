import mongoose, { Schema, models } from 'mongoose';

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, default: null },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  googleId: { type: String, default: null },
  avatar: { type: String, default: null },
  isEmailVerified: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });

export const User = models.User || mongoose.model('User', userSchema);
