import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import connectDB from '@/lib/db';
import { applyBookingStatusTransition } from '@/lib/booking-workflow';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key');

async function verifyAdmin(request) {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return false;
  try { await jwtVerify(token, JWT_SECRET); return true; } catch { return false; }
}

export async function PUT(request, { params }) {
  const isAdmin = await verifyAdmin(request);
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  try {
    const { id } = await params;
    const { status } = await request.json();
    await connectDB();
    const baseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    await applyBookingStatusTransition({ bookingId: id, nextStatus: status, baseUrl });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: error.message.includes('time slot') ? 409 : 500 });
  }
}
