import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import { User } from '@/models/User';
import { OTP } from '@/models/OTP';
import { sendOtpEmail } from '@/lib/mailer';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    if (user.authProvider === 'google' && !user.password) {
      return NextResponse.json({ error: 'This account uses Google sign-in. Please continue with Google.' }, { status: 400 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.deleteMany({ email: user.email, purpose: 'login' });
    await OTP.create({
      email: user.email,
      name: user.name,
      purpose: 'login',
      userId: user._id.toString(),
      code,
    });

    await sendOtpEmail({ email: user.email, name: user.name, code, purpose: 'login' });

    return NextResponse.json({
      requiresOtp: true,
      email: user.email,
      message: 'We sent a verification code to your email.',
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
