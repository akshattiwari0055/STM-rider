import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Booking } from '@/models/Booking';
import { applyBookingStatusTransition } from '@/lib/booking-workflow';

/**
 * UPI Payment Callback Handler
 *
 * When a user pays via a UPI deep-link that includes:
 *   &tr=<bookingId>&url=<this-endpoint>
 *
 * GPay / PhonePe / Paytm redirect the user's browser to:
 *   GET /api/payment/upi-callback?Status=SUCCESS&txnId=<UTR>&txnRef=<bookingId>&responseCode=00
 *
 * We verify Status === 'SUCCESS', record the UTR, activate the booking,
 * then redirect the user back to their booking page.
 *
 * This requires NO email, NO Razorpay, NO 3rd party — pure UPI protocol.
 */

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const status       = (searchParams.get('Status') || searchParams.get('status') || '').toUpperCase();
  const txnId        = searchParams.get('txnId')    || searchParams.get('txnid')    || ''; // UTR number
  const txnRef       = searchParams.get('txnRef')   || searchParams.get('txnref')   || ''; // our booking ID
  const responseCode = searchParams.get('responseCode') || searchParams.get('responsecode') || '';

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

  // txnRef is our booking _id that we put in &tr=
  const bookingId = txnRef;

  // ── Reject non-success ────────────────────────────────────────────────────────
  if (status !== 'SUCCESS' || !bookingId) {
    console.warn('[upi-callback] Payment not successful or missing ref', { status, txnRef, txnId, responseCode });
    // Redirect user to a failure page or back to the booking
    const redirectUrl = bookingId
      ? `${baseUrl}/book/${bookingId}?payment=failed&reason=${encodeURIComponent(status || 'unknown')}`
      : `${baseUrl}/vehicles?payment=failed`;
    return NextResponse.redirect(redirectUrl);
  }

  // ── Activate booking ─────────────────────────────────────────────────────────
  try {
    await connectDB();

    const booking = await Booking.findById(bookingId).select('status vehicle');
    if (!booking) {
      console.error('[upi-callback] Booking not found:', bookingId);
      return NextResponse.redirect(`${baseUrl}/vehicles?payment=error`);
    }

    // Record UTR even if already active (idempotent)
    if (txnId) {
      booking.utrNumber = txnId;
    }
    // Mark payment as verified via UPI callback
    booking.paymentVerifiedVia = 'upi-callback';
    await booking.save();

    if (booking.status !== 'Active') {
      await applyBookingStatusTransition({ bookingId, nextStatus: 'Active', baseUrl });
    }

    console.info('[upi-callback] Payment verified', { bookingId, txnId, status });

    // Redirect user back to booking page — the frontend polling will pick up status=Active
    return NextResponse.redirect(
      `${baseUrl}/book/${booking.vehicle}?booking=${bookingId}&payment=success`
    );
  } catch (err) {
    console.error('[upi-callback] Error:', err.message);
    return NextResponse.redirect(`${baseUrl}/vehicles?payment=error`);
  }
}

/**
 * Some UPI apps POST the callback instead of GET.
 * Handle both methods identically.
 */
export async function POST(request) {
  let body = {};
  try {
    const text = await request.text();
    // Try JSON first, then URL-encoded form
    try {
      body = JSON.parse(text);
    } catch {
      body = Object.fromEntries(new URLSearchParams(text));
    }
  } catch { /* ignore parse errors */ }

  // Build a fake URL with the body params so we can reuse the GET handler
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  const params  = new URLSearchParams(body).toString();
  const fakeURL = `${baseUrl}/api/payment/upi-callback?${params}`;

  return GET(new Request(fakeURL));
}
