import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import connectDB from '@/lib/db';
import { Booking } from '@/models/Booking';
import { Vehicle } from '@/models/Vehicle';

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

    const booking = await Booking.findById(id).populate('vehicle');
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    booking.status = status;
    await booking.save();

    // If admin marks booking Completed or Cancelled, restore vehicle to Available
    if ((status === 'Completed' || status === 'Cancelled') && booking.vehicle) {
      const otherActive = await Booking.findOne({
        vehicle: booking.vehicle._id,
        status: 'Active',
        _id: { $ne: booking._id },
      });
      if (!otherActive) {
        await Vehicle.findByIdAndUpdate(booking.vehicle._id, { status: 'Available' });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
