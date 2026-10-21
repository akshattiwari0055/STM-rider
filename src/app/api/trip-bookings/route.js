import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import connectDB from '@/lib/db';
import { TripBooking } from '@/models/TripBooking';
import { Trip } from '@/models/Trip';
import { User } from '@/models/User';
import { Coupon } from '@/models/Coupon';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key');

export async function GET(request) {
  try {
    await connectDB();
    const token = request.cookies.get('user_token')?.value;
    const adminToken = request.cookies.get('admin_token')?.value;
    const { searchParams } = new URL(request.url);
    const userOnly = searchParams.get('userOnly') === 'true';

    // If request specifies userOnly or user is not admin
    if (userOnly || !adminToken) {
      if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userBookings = await TripBooking.find({ user: payload.userId })
          .populate('trip')
          .sort({ createdAt: -1 });
        return NextResponse.json(userBookings);
      } catch {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
    }

    // Admin sees all trip bookings
    const allBookings = await TripBooking.find()
      .populate('trip')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    return NextResponse.json(allBookings);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const tripId = body.trip || body.tripId;
    if (!tripId || !body.customerName || !body.phone || !body.departureDate) {
      return NextResponse.json({ error: 'Trip, name, phone, and departure date are required.' }, { status: 400 });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found.' }, { status: 404 });
    }

    const seats = Math.max(1, Number(body.numberOfSeats || 1));
    if (trip.seatsAvailable < seats) {
      return NextResponse.json({ 
        error: `Only ${trip.seatsAvailable} seat(s) remaining for this trip. Cannot book ${seats} seat(s).` 
      }, { status: 400 });
    }

    // Check for user token
    let userId = null;
    let customerEmail = body.customerEmail || null;
    const token = request.cookies.get('user_token')?.value;
    if (token) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        userId = payload.userId;
        if (!customerEmail && payload.email) {
          customerEmail = payload.email;
        }
      } catch { /* anonymous */ }
    }

    if (userId && !customerEmail) {
      const u = await User.findById(userId).select('email');
      if (u?.email) customerEmail = u.email;
    }

    const originalPrice = seats * trip.price;
    let finalPrice = originalPrice;
    let appliedCoupon = null;

    if (body.couponCode) {
      const coupon = await Coupon.findOne({ code: body.couponCode.trim().toUpperCase() });
      if (coupon && coupon.isActive && coupon.usedCount < coupon.usageLimit) {
        finalPrice = Math.max(0, originalPrice - (originalPrice * coupon.discountPercentage) / 100);
        appliedCoupon = coupon;
      } else {
        return NextResponse.json({ error: 'Invalid or expired coupon code.' }, { status: 400 });
      }
    }

    const newBooking = await TripBooking.create({
      trip: trip._id,
      user: userId,
      customerName: body.customerName,
      customerEmail,
      phone: body.phone,
      numberOfSeats: seats,
      departureDate: body.departureDate,
      pickupPoint: body.pickupPoint || trip.pickupLocation,
      totalPrice: finalPrice,
      originalPrice,
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      idCardImage: body.idCardImage,
      aadhaarCardImage: body.aadhaarCardImage,
      status: 'Pending',
      notes: body.notes || '',
    });

    if (appliedCoupon) {
      appliedCoupon.usedCount += 1;
      await appliedCoupon.save();
    }

    // Update remaining seats in trip
    const updatedAvailable = Math.max(0, trip.seatsAvailable - seats);
    trip.seatsAvailable = updatedAvailable;
    if (updatedAvailable === 0) {
      trip.status = 'Sold Out';
    } else if (updatedAvailable <= 5) {
      trip.status = 'Filling Fast';
    }
    await trip.save();

    const populated = await TripBooking.findById(newBooking._id).populate('trip');
    return NextResponse.json(populated, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
