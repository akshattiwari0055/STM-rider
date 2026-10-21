import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { TripBooking } from '@/models/TripBooking';
import { Trip } from '@/models/Trip';
import { buildTripReceiptPdfBuffer } from '@/lib/tripReceipt';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const booking = await TripBooking.findById(id).populate('trip');
    if (!booking) {
      return NextResponse.json({ error: 'Trip booking not found.' }, { status: 404 });
    }

    const trip = booking.trip || {};
    const pdfBuffer = buildTripReceiptPdfBuffer({ booking, trip });

    const safeTitle = (trip.title || 'Trip').replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `STM_RIDER_Trip_${safeTitle}_${booking._id.toString().slice(-6)}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
