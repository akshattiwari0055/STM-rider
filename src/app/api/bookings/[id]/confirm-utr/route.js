import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Booking } from '@/models/Booking';
import { detectPaymentInGmail } from '@/lib/payment-gateway';
import { applyBookingStatusTransition } from '@/lib/booking-workflow';

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

    const cleaned = utrNumber.trim().toUpperCase();
    await connectDB();

    const booking = await Booking.findById(id);
    if (!booking) return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    if (booking.status === 'Active') return NextResponse.json({ success: true });
    if (booking.status === 'Cancelled') {
      return NextResponse.json({ error: 'This booking has been cancelled.' }, { status: 400 });
    }

    // Prevent duplicate UTR
    const dup = await Booking.findOne({ utrNumber: cleaned, _id: { $ne: id } });
    if (dup) {
      return NextResponse.json(
        { error: 'This UTR has already been used for another booking.' },
        { status: 400 }
      );
    }

    // Verify via Gmail: search for the unique amount in bank alert emails
    let found = false;
    try {
      if (booking.uniquePaymentAmount) {
        found = await detectPaymentInGmail(booking.uniquePaymentAmount);
      }
    } catch (imapErr) {
      console.error('[confirm-utr] IMAP error:', imapErr?.message);
      return NextResponse.json(
        { error: 'Payment verification is temporarily unavailable. Please try again in a moment.' },
        { status: 503 }
      );
    }

    if (!found) {
      return NextResponse.json(
        {
          error:
            'Payment not found in bank records. Please ensure:\n' +
            '• You paid the EXACT amount shown (including paise)\n' +
            '• Payment was made to the correct UPI ID\n' +
            'If you just paid, wait 1–2 minutes for the bank alert and try again.',
        },
        { status: 422 }
      );
    }

    await Booking.findByIdAndUpdate(id, { utrNumber: cleaned });

    const baseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    await applyBookingStatusTransition({ bookingId: id, nextStatus: 'Active', baseUrl });

    return NextResponse.json({ success: true, message: 'Payment verified! Your booking is now active.' });
  } catch (error) {
    console.error('[confirm-utr]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
