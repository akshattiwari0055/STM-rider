import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import {
  applyBookingStatusTransition,
  verifyBookingActionToken,
} from '@/lib/booking-workflow';

function renderDecisionHtml({ title, message, accent = '#16a34a' }) {
  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${title}</title>
      </head>
      <body style="margin:0;background:#0b0b0b;color:#f8fafc;font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px;">
        <div style="max-width:560px;width:100%;background:#111827;border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:32px;">
          <div style="width:56px;height:56px;border-radius:16px;background:${accent};display:flex;align-items:center;justify-content:center;color:#111827;font-size:28px;font-weight:700;margin-bottom:18px;">✓</div>
          <h1 style="margin:0 0 10px;font-size:28px;">${title}</h1>
          <p style="margin:0;color:#cbd5e1;line-height:1.7;">${message}</p>
        </div>
      </body>
    </html>
  `;
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return new NextResponse(renderDecisionHtml({
        title: 'Missing token',
        message: 'This approval link is incomplete. Please use the latest email sent by Elite Bike Rentals.',
        accent: '#f59e0b',
      }), {
        status: 400,
        headers: { 'content-type': 'text/html; charset=utf-8' },
      });
    }

    const payload = await verifyBookingActionToken(token);
    if (payload.bookingId !== id) {
      throw new Error('Booking token does not match this booking.');
    }

    await connectDB();
    const baseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const nextStatus =
      payload.action === 'approve' ? 'Active' :
      payload.action === 'complete' ? 'Completed' :
      'Cancelled';
    await applyBookingStatusTransition({ bookingId: id, nextStatus, baseUrl });

    return new NextResponse(renderDecisionHtml({
      title:
        nextStatus === 'Active' ? 'Booking approved' :
        nextStatus === 'Completed' ? 'Vehicle marked returned' :
        'Booking cancelled',
      message:
        nextStatus === 'Active'
          ? 'The booking has been approved. The customer has been notified by email with the receipt PDF.'
          : nextStatus === 'Completed'
            ? 'The vehicle has been marked returned and is available again.'
            : 'The booking has been cancelled and the reserved slot has been released.',
      accent: nextStatus === 'Cancelled' ? '#dc2626' : '#16a34a',
    }), {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  } catch (error) {
    return new NextResponse(renderDecisionHtml({
      title: 'Action failed',
      message: error.message || 'This email action could not be completed.',
      accent: '#dc2626',
    }), {
      status: 400,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  }
}
