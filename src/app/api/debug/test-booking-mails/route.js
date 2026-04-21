import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Booking } from '@/models/Booking';
import { User } from '@/models/User';
import {
  sendAdminBookingReviewEmail,
  sendBookingApprovedEmail,
  sendVehicleReturnReminderEmail,
} from '@/lib/mailer';
import { createBookingActionToken } from '@/lib/booking-workflow';

function isAuthorized(request) {
  const secret = process.env.CRON_SECRET || process.env.JWT_SECRET;
  const provided =
    request.nextUrl.searchParams.get('secret') ||
    request.headers.get('x-debug-secret') ||
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

  return Boolean(secret && provided && provided === secret);
}

export async function GET(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    const booking = await Booking.findOne({})
      .sort({ createdAt: -1 })
      .populate('vehicle')
      .populate('user');

    if (!booking || !booking.vehicle) {
      return NextResponse.json({ error: 'No booking with vehicle found to test mail flow.' }, { status: 404 });
    }

    const baseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const customerEmail = booking.customerEmail || booking.user?.email || process.env.SMTP_USER;

    const approveToken = await createBookingActionToken({
      bookingId: booking._id.toString(),
      action: 'approve',
    });
    const rejectToken = await createBookingActionToken({
      bookingId: booking._id.toString(),
      action: 'cancel',
    });
    const returnToken = await createBookingActionToken({
      bookingId: booking._id.toString(),
      action: 'complete',
    });

    const mode = request.nextUrl.searchParams.get('mode') || 'all';
    const results = [];

    if (mode === 'admin' || mode === 'all') {
      await sendAdminBookingReviewEmail({
        booking,
        vehicle: booking.vehicle,
        customerEmail,
        baseUrl,
        approveUrl: `${baseUrl}/api/admin/bookings/${booking._id}/decision?token=${encodeURIComponent(approveToken)}`,
        rejectUrl: `${baseUrl}/api/admin/bookings/${booking._id}/decision?token=${encodeURIComponent(rejectToken)}`,
      });
      results.push('admin-booking-review');
    }

    if (mode === 'approved' || mode === 'all') {
      await sendBookingApprovedEmail({
        booking,
        vehicle: booking.vehicle,
        customerEmail,
        customerName: booking.customerName,
        baseUrl,
      });
      results.push('booking-approved');
    }

    if (mode === 'return' || mode === 'all') {
      await sendVehicleReturnReminderEmail({
        booking,
        vehicle: booking.vehicle,
        customerEmail,
        baseUrl,
        confirmReturnUrl: `${baseUrl}/api/admin/bookings/${booking._id}/decision?token=${encodeURIComponent(returnToken)}`,
      });
      results.push('vehicle-return-reminder');
    }

    return NextResponse.json({
      success: true,
      sent: results,
      bookingId: booking._id.toString(),
      customerEmail,
      adminEmail: process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER,
    });
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
    }, { status: 500 });
  }
}
