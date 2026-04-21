import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import { User } from '@/models/User';
import { OTP } from '@/models/OTP';
import { sendOtpEmail } from '@/lib/mailer';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    await connectDB();

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const normalizedEmail = email.toLowerCase();
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.deleteMany({ email: normalizedEmail, purpose: 'register' });
    await OTP.create({
      email: normalizedEmail,
      name,
      password: hashed,
      purpose: 'register',
      code,
    });

    await sendOtpEmail({ email: normalizedEmail, name, code, purpose: 'register' });

    return NextResponse.json({
      requiresOtp: true,
      email: normalizedEmail,
      message: 'We sent a verification code to your email.',
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
