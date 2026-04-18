import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import connectDB from '@/lib/db';
import { Vehicle } from '@/models/Vehicle';
import { Booking } from '@/models/Booking';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key');

async function verifyAdmin(request) {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

// POST /api/admin/reset-vehicles — admin emergency: mark all vehicles Available + complete all active bookings
export async function POST(request) {
  const isAdmin = await verifyAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    await connectDB();

    // Complete all active bookings
    await Booking.updateMany({ status: 'Active' }, { status: 'Completed' });

    // Mark ALL vehicles as Available
    const result = await Vehicle.updateMany({}, { status: 'Available' });

    return NextResponse.json({
      success: true,
      vehiclesReset: result.modifiedCount,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
