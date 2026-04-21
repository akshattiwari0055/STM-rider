import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { OTP } from '@/models/OTP';
import { User } from '@/models/User';
import { sendOtpEmail } from '@/lib/mailer';

export async function POST(request) {
  try {
    const { email, purpose } = await request.json();

    if (!email || !purpose) {
      return NextResponse.json({ error: 'Email and purpose are required.' }, { status: 400 });
    }

    if (!['register', 'login'].includes(purpose)) {
      return NextResponse.json({ error: 'Invalid OTP purpose.' }, { status: 400 });
    }

    await connectDB();

    const normalizedEmail = email.toLowerCase();
    const latestOtp = await OTP.findOne({ email: normalizedEmail, purpose }).sort({ createdAt: -1 });

    if (!latestOtp) {
      return NextResponse.json({ error: 'No pending verification found. Please start again.' }, { status: 404 });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    latestOtp.code = code;
    latestOtp.createdAt = new Date();
    await latestOtp.save();

    let name = latestOtp.name;
    if (purpose === 'login' && latestOtp.userId) {
      const user = await User.findById(latestOtp.userId).select('name');
      name = user?.name || name;
    }

    await sendOtpEmail({ email: normalizedEmail, name, code, purpose });

    return NextResponse.json({ message: 'A new OTP has been sent to your email.' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
