import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Booking } from '@/models/Booking';
import { applyBookingStatusTransition } from '@/lib/booking-workflow';

// UTR (Unique Transaction Reference) is a 12-alphanumeric code assigned by UPI
// It appears in PhonePe, GPay, Paytm etc. after a successful payment.
const UTR_REGEX = /^[A-Z0-9]{12,22}$/i;

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const { utrNumber } = await request.json();

    if (!utrNumber || !UTR_REGEX.test(utrNumber.trim())) {
      return NextResponse.json(
        { error: 'Please enter a valid UTR / Transaction ID (12–22 alphanumeric characters).' },
        { status: 400 }
      );
    }

    await connectDB();

    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }

    if (booking.status === 'Active') {
      return NextResponse.json({ success: true, message: 'Booking is already active.' });
    }

    if (booking.status === 'Cancelled') {
      return NextResponse.json(
        { error: 'This booking has been cancelled. Please create a new booking.' },
        { status: 400 }
      );
    }

    // Check if this UTR was already used for another booking (prevent duplicate use)
    const duplicate = await Booking.findOne({
      utrNumber: utrNumber.trim().toUpperCase(),
      _id: { $ne: id },
    });
    if (duplicate) {
      return NextResponse.json(
        { error: 'This UTR / Transaction ID has already been used for another booking.' },
        { status: 400 }
      );
    }

    // Save the UTR number
    await Booking.findByIdAndUpdate(id, {
      utrNumber: utrNumber.trim().toUpperCase(),
    });

    // Activate the booking and send confirmation email
    const baseUrl =
      process.env.APP_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      new URL(request.url).origin;

    await applyBookingStatusTransition({
      bookingId: id,
      nextStatus: 'Active',
      baseUrl,
    });

    return NextResponse.json({
      success: true,
      message: 'Payment confirmed! Your booking is now active.',
    });
  } catch (error) {
    console.error('[confirm-utr] error', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
