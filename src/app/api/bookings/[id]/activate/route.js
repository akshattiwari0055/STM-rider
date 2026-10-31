import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { applyBookingStatusTransition } from '@/lib/booking-workflow';
import { Booking } from '@/models/Booking';

// POST /api/bookings/[id]/activate
// Instantly activates a pending booking after user confirms payment.
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    await connectDB();

    const booking = await Booking.findById(id).select('status');
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }
    if (booking.status === 'Active') {
      return NextResponse.json({ success: true }); // already active, idempotent
    }
    if (booking.status === 'Cancelled') {
      return NextResponse.json({ error: 'This booking has been cancelled.' }, { status: 400 });
    }

    const baseUrl =
      process.env.APP_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      new URL(request.url).origin;

    await applyBookingStatusTransition({ bookingId: id, nextStatus: 'Active', baseUrl });

    return NextResponse.json({ success: true, message: 'Booking confirmed!' });
  } catch (error) {
    console.error('[activate]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
