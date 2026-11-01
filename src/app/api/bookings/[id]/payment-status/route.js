import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Booking } from '@/models/Booking';

/**
 * GET /api/bookings/[id]/payment-status
 *
 * Polled by the frontend every 4 seconds while the user is on the payment screen.
 * Returns { status: 'confirmed' } once the UPI callback has activated the booking.
 * No email, no Razorpay — the UPI app itself calls /api/payment/upi-callback,
 * which sets the booking to Active. This endpoint just reads that DB state.
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    await connectDB();

    const booking = await Booking.findById(id).select('status');
    if (!booking) {
      return NextResponse.json({ status: 'error', message: 'Booking not found.' }, { status: 404 });
    }

    if (booking.status === 'Active') {
      return NextResponse.json({ status: 'confirmed' });
    }
    if (booking.status === 'Cancelled') {
      return NextResponse.json({ status: 'cancelled', message: 'This booking was cancelled.' });
    }

    // Still Pending — UPI callback hasn't arrived yet
    return NextResponse.json({ status: 'pending', message: 'Waiting for UPI payment confirmation...' });
  } catch (error) {
    console.error('[payment-status]', error);
    return NextResponse.json({ status: 'pending', message: 'Checking...' });
  }
}
