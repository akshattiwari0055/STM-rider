import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { OTP } from '@/models/OTP';
import { User } from '@/models/User';
import { createUserToken, setAuthCookie } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, code, purpose } = await request.json();

    if (!email || !code || !purpose) {
      return NextResponse.json({ error: 'Email, code, and purpose are required.' }, { status: 400 });
    }

    if (!['register', 'login'].includes(purpose)) {
      return NextResponse.json({ error: 'Invalid OTP purpose.' }, { status: 400 });
    }

    await connectDB();

    const otpEntry = await OTP.findOne({
      email: email.toLowerCase(),
      purpose,
      code,
    }).sort({ createdAt: -1 });

    if (!otpEntry) {
      return NextResponse.json({ error: 'Invalid or expired OTP.' }, { status: 400 });
    }

    let user;

    if (purpose === 'register') {
      const existing = await User.findOne({ email: otpEntry.email });
      if (existing) {
        await OTP.deleteMany({ email: otpEntry.email, purpose: 'register' });
        return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
      }

      user = await User.create({
        name: otpEntry.name,
        email: otpEntry.email,
        password: otpEntry.password,
        authProvider: 'local',
        isEmailVerified: true,
      });
    } else {
      user = await User.findById(otpEntry.userId);
      if (!user) {
        await OTP.deleteMany({ email: otpEntry.email, purpose: 'login' });
        return NextResponse.json({ error: 'User not found.' }, { status: 404 });
      }
    }

    await OTP.deleteMany({ email: otpEntry.email, purpose });

    const token = await createUserToken(user);
    const response = NextResponse.json({
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });

    return setAuthCookie(response, token);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
