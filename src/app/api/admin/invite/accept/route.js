import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import connectDB from '@/lib/db';
import { User } from '@/models/User';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key');

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return new NextResponse('Invalid or missing invitation token.', { status: 400 });
    }

    const decoded = await jwtVerify(token, JWT_SECRET);
    const email = decoded.payload.email;

    await connectDB();
    const user = await User.findOne({ email });

    if (!user) {
      const baseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || url.origin;
      return NextResponse.redirect(`${baseUrl}/signup?error=admin_invite_no_account&email=${encodeURIComponent(email)}`);
    }

    if (user.role !== 'superadmin') {
      user.role = 'admin';
      await user.save();
    }

    const baseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || url.origin;
    return NextResponse.redirect(`${baseUrl}/admin/login?message=admin_access_granted`);
  } catch (error) {
    return new NextResponse('Invalid or expired invitation token.', { status: 400 });
  }
}
