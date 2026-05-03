import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db';
import { Booking } from '@/models/Booking';
import { applyBookingStatusTransition } from '@/lib/booking-workflow';

export async function POST(request) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      bookingId 
    } = await request.json();

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    await connectDB();
    
    // Update booking with payment ID first
    await Booking.findByIdAndUpdate(bookingId, {
      razorpayPaymentId: razorpay_payment_id
    });

    // Use the existing workflow to transition status and send emails
    const baseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const result = await applyBookingStatusTransition({
      bookingId,
      nextStatus: 'Active',
      baseUrl
    });

    return NextResponse.json({ success: true, message: 'Payment verified and booking activated' });
  } catch (error) {
    console.error('[razorpay:verify] error', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
