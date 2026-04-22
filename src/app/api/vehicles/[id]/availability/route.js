import { NextResponse } from 'next/server';
import { addDays, eachDayOfInterval, endOfDay, endOfMonth, format, max, min, startOfDay } from 'date-fns';
import connectDB from '@/lib/db';
import { Booking } from '@/models/Booking';
import { Vehicle } from '@/models/Vehicle';
import { cleanupBookingStates } from '@/lib/booking-workflow';

export const dynamic = 'force-dynamic';

function getBookingWindow(booking) {
  const start = new Date(booking.startDate);
  const end = booking.endDate
    ? new Date(booking.endDate)
    : new Date(start.getTime() + Number(booking.durationHours || 0) * 60 * 60 * 1000);

  return { start, end };
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const now = new Date();
    const windowStart = startOfDay(now);
    const windowEnd = endOfMonth(addDays(windowStart, 89));

    await connectDB();
    await cleanupBookingStates();

    const vehicle = await Vehicle.findById(id).select('_id name status');
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found.' }, { status: 404 });
    }

    const bookings = await Booking.find({
      vehicle: id,
      startDate: { $lt: windowEnd },
      endDate: { $gt: windowStart },
      $or: [
        { status: 'Active' },
        { status: 'Pending', verificationPendingUntil: { $gt: now } },
      ],
    })
      .select('startDate endDate durationHours status verificationPendingUntil')
      .sort({ startDate: 1 });

    const blockedRanges = bookings.map((booking) => {
      const { start, end } = getBookingWindow(booking);
      return {
        id: booking._id.toString(),
        status: booking.status,
        start: start.toISOString(),
        end: end.toISOString(),
      };
    });

    const daySummaries = eachDayOfInterval({ start: windowStart, end: windowEnd }).map((day) => {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);

      const windows = blockedRanges
        .filter((range) => new Date(range.start) < dayEnd && new Date(range.end) > dayStart)
        .map((range) => {
          const overlapStart = max([new Date(range.start), dayStart]);
          const overlapEnd = min([new Date(range.end), dayEnd]);
          const hoursBlocked = Math.max(
            0,
            (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60)
          );

          return {
            ...range,
            start: overlapStart.toISOString(),
            end: overlapEnd.toISOString(),
            hoursBlocked,
          };
        });

      const totalBlockedHours = windows.reduce((sum, window) => sum + window.hoursBlocked, 0);
      const status =
        totalBlockedHours >= 23 ? 'blocked' : windows.length > 0 ? 'partial' : 'available';

      return {
        date: format(day, 'yyyy-MM-dd'),
        status,
        windows,
      };
    });

    return NextResponse.json({
      vehicle: {
        id: vehicle._id.toString(),
        name: vehicle.name,
        status: vehicle.status,
      },
      generatedAt: now.toISOString(),
      windowStart: windowStart.toISOString(),
      windowEnd: windowEnd.toISOString(),
      blockedRanges,
      daySummaries,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
