import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { TripBooking } from '@/models/TripBooking';
import { Trip } from '@/models/Trip';
import { User } from '@/models/User';
import { sendTripBookingApprovedEmail } from '@/lib/mailer';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const booking = await TripBooking.findById(id).populate('trip');
    if (!booking) {
      return NextResponse.json({ error: 'Trip booking not found.' }, { status: 404 });
    }
    return NextResponse.json(booking);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const body = await request.json();

    const currentBooking = await TripBooking.findById(id);
    if (!currentBooking) {
      return NextResponse.json({ error: 'Trip booking not found.' }, { status: 404 });
    }

    const previousStatus = currentBooking.status;
    const nextStatus = body.status;

    // If changing to Cancelled and was not previously Cancelled, return the seats
    if (nextStatus === 'Cancelled' && previousStatus !== 'Cancelled') {
      const trip = await Trip.findById(currentBooking.trip);
      if (trip) {
        trip.seatsAvailable = Math.min(trip.seatsTotal, trip.seatsAvailable + currentBooking.numberOfSeats);
        if (trip.status === 'Sold Out' && trip.seatsAvailable > 0) {
          trip.status = trip.seatsAvailable <= 5 ? 'Filling Fast' : 'Open';
        }
        await trip.save();
      }
    }

    // If un-cancelling a cancelled booking, deduct seats again if available
    if (previousStatus === 'Cancelled' && nextStatus && nextStatus !== 'Cancelled') {
      const trip = await Trip.findById(currentBooking.trip);
      if (trip) {
        trip.seatsAvailable = Math.max(0, trip.seatsAvailable - currentBooking.numberOfSeats);
        if (trip.seatsAvailable === 0) {
          trip.status = 'Sold Out';
        }
        await trip.save();
      }
    }

    currentBooking.status = nextStatus || currentBooking.status;
    if (body.notes !== undefined) currentBooking.notes = body.notes;

    await currentBooking.save();
    const populated = await TripBooking.findById(id).populate('trip').populate('user');

    // If admin confirms payment/booking, send customer confirmation email with PDF voucher
    if (nextStatus === 'Confirmed' && previousStatus !== 'Confirmed') {
      const email = populated.customerEmail || populated.user?.email;
      if (email) {
        try {
          await sendTripBookingApprovedEmail({
            booking: populated,
            trip: populated.trip,
            customerEmail: email,
            customerName: populated.customerName || populated.user?.name,
          });
        } catch (mailError) {
          console.error('[trip-booking:approval-email] Error sending email:', mailError?.message || mailError);
        }
      }
    }

    return NextResponse.json(populated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const deleted = await TripBooking.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Trip booking not found.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Booking deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
