import { NextResponse } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import { User } from '@/models/User';
import { sendAdminInviteEmail } from '@/lib/mailer';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key');

export async function POST(request) {
  try {
    const token = request.cookies.get('admin_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const decoded = await jwtVerify(token, JWT_SECRET);
    if (decoded.payload.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { email, password } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await connectDB();
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (password && password.trim()) {
      if (password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
      }

      if (existingUser) {
        // Upgrade role to admin if user exists but isn't already superadmin/admin
        if (existingUser.role !== 'superadmin' && existingUser.role !== 'admin') {
          existingUser.role = 'admin';
          await existingUser.save();
        }
      } else {
        // Pre-create the admin in the database
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
          name: normalizedEmail.split('@')[0],
          email: normalizedEmail,
          password: hashedPassword,
          role: 'admin',
          authProvider: 'local',
          isEmailVerified: true
        });
      }
    }

    // Generate a secure invite token
    const inviteToken = await new SignJWT({ email: normalizedEmail })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    const baseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const inviteUrl = `${baseUrl}/api/admin/invite/accept?token=${inviteToken}`;

    await sendAdminInviteEmail({ email: normalizedEmail, inviteUrl, password });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Invite Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
