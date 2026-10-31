import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Booking } from '@/models/Booking';
import { detectPaymentInGmail } from '@/lib/payment-gateway';
import { applyBookingStatusTransition } from '@/lib/booking-workflow';

// GET /api/bookings/[id]/payment-status
// Called by the frontend every few seconds to check if payment has been detected.
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    await connectDB();

    const booking = await Booking.findById(id).select('status uniquePaymentAmount');
    if (!booking) {
      return NextResponse.json({ status: 'error', message: 'Booking not found.' }, { status: 404 });
    }

    // Already activated (e.g. by a previous poll or manual UTR)
    if (booking.status === 'Active') {
      return NextResponse.json({ status: 'confirmed' });
    }

    if (booking.status === 'Cancelled') {
      return NextResponse.json({ status: 'cancelled', message: 'This booking has been cancelled.' });
    }

    if (!booking.uniquePaymentAmount) {
      return NextResponse.json({ status: 'pending', message: 'Payment amount not set.' });
    }

    // Search Gmail inbox for the unique amount
    let found = false;
    try {
      found = await detectPaymentInGmail(booking.uniquePaymentAmount);
    } catch (imapErr) {
      console.error('[payment-status] IMAP error:', imapErr?.message);
      // Return pending (don't crash — frontend will keep polling)
      return NextResponse.json({ status: 'pending', message: 'Verifying...' });
    }

    if (!found) {
      return NextResponse.json({ status: 'pending', message: 'Waiting for payment...' });
    }

    // Payment detected! Activate the booking.
    const baseUrl =
      process.env.APP_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      new URL(request.url).origin;

    try {
      await applyBookingStatusTransition({ bookingId: id, nextStatus: 'Active', baseUrl });
    } catch (activationErr) {
      console.error('[payment-status] activation error:', activationErr?.message);
      return NextResponse.json({ status: 'pending', message: 'Activating booking...' });
    }

    return NextResponse.json({ status: 'confirmed', message: 'Payment verified! Booking is active.' });
  } catch (error) {
    console.error('[payment-status] error:', error);
    return NextResponse.json({ status: 'pending', message: 'Checking payment...' });
  }
}
