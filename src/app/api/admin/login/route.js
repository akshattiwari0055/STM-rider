import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import connectDB from '@/lib/db';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key');


export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // ── Legacy hardcoded admin (fallback) ──────────────────────────────
    if (email === 'admin@yellowhut.com' && password === 'admin123') {
      const token = await new SignJWT({ role: 'admin', email })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('1d')
        .sign(JWT_SECRET);

      const response = NextResponse.json({ success: true, name: 'Admin' });
      response.cookies.set('admin_token', token, {
        httpOnly: true, path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24,
      });
      return response;
    }

    // ── Check admin roles in DB ──────────────────────
    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json({ error: 'Admin account not found. Please register as a user first, then have a Super Admin grant you access.' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
    }

    // Auto-promote super admin
    if (user.email === 'akshattiwari6939@gmail.com' && user.role !== 'superadmin') {
      user.role = 'superadmin';
      await user.save();
    }

    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return NextResponse.json({ error: 'You do not have admin privileges.' }, { status: 403 });
    }

    // Issue admin token
    const token = await new SignJWT({ role: user.role, email: user.email, userId: user._id.toString() })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1d')
      .sign(JWT_SECRET);

    const response = NextResponse.json({ success: true, name: user.name, role: user.role });
    response.cookies.set('admin_token', token, {
      httpOnly: true, path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24,
    });
    return response;

    return NextResponse.json({ error: 'Invalid admin credentials.' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
