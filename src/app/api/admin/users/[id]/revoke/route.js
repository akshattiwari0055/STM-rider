import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/models/User';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key');

export async function POST(request, { params }) {
  try {
    const token = request.cookies.get('admin_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const decoded = await jwtVerify(token, JWT_SECRET);
    if (decoded.payload.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const user = await User.findById(params.id);
    
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (user.email === 'akshattiwari6939@gmail.com') {
      return NextResponse.json({ error: 'Cannot revoke super admin' }, { status: 403 });
    }

    user.role = 'user';
    await user.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
