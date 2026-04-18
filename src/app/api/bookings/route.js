import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import connectDB from '@/lib/db';
import { Booking } from '@/models/Booking';
import { Vehicle } from '@/models/Vehicle';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key');

export async function GET() {
  try {
    await connectDB();
    const bookings = await Booking.find().populate('vehicle').sort({ createdAt: -1 });
    return NextResponse.json(bookings);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    await connectDB();

    const vehicle = await Vehicle.findById(body.vehicle);
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found.' }, { status: 404 });
    }
    if (vehicle.status !== 'Available') {
      return NextResponse.json({ error: 'Vehicle is currently not available.' }, { status: 400 });
    }

    // Determine price — validate against tieredPricing if available, otherwise trust client
    let finalPrice = Number(body.totalPrice);
    if (vehicle.tieredPricing && vehicle.tieredPricing.length > 0) {
      const tier = vehicle.tieredPricing.find(t => t.hours === Number(body.durationHours));
      if (!tier) {
        return NextResponse.json({ error: 'Invalid duration selected for this vehicle.' }, { status: 400 });
      }
      finalPrice = tier.price; // always use server-side price when available
    }

    // Attach user if logged in
    let userId = null;
    const token = request.cookies.get('user_token')?.value;
    if (token) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        userId = payload.userId;
      } catch { /* anonymous booking */ }
    }

    const bookingData = {
      vehicle: body.vehicle,
      customerName: body.customerName,
      phone: body.phone,
      startDate: new Date(body.startDate),
      durationHours: Number(body.durationHours),
      totalPrice: finalPrice,
      idCardImage: body.idCardImage,
      aadhaarCardImage: body.aadhaarCardImage,
      status: 'Pending', // stays Pending until admin confirms payment
    };
    if (userId) bookingData.user = userId;

    const newBooking = await Booking.create(bookingData);

    // Mark vehicle as Busy during the rental period
    vehicle.status = 'Busy';
    await vehicle.save();

    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
