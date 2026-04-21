import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import connectDB from '@/lib/db';
import { Booking } from '@/models/Booking';
import { Vehicle } from '@/models/Vehicle';
import { Coupon } from '@/models/Coupon';
import { User } from '@/models/User';
import {
  calculateBookingEndDate,
  cleanupBookingStates,
  createBookingSlotKey,
  findConflictingBooking,
  getVerificationExpiryDate,
  notifyAdminForNewBooking,
  sendOverdueReturnReminders,
} from '@/lib/booking-workflow';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key');

export async function GET(request) {
  try {
    await connectDB();
    await cleanupBookingStates();
    const baseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    await sendOverdueReturnReminders({ baseUrl });
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
    await cleanupBookingStates();

    const vehicle = await Vehicle.findById(body.vehicle);
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found.' }, { status: 404 });
    }
    if (vehicle.status === 'Under Maintenance') {
      return NextResponse.json({ error: 'Vehicle is currently under maintenance.' }, { status: 400 });
    }

    let finalPrice = Number(body.totalPrice);
    if (!body.isManual && vehicle.tieredPricing && vehicle.tieredPricing.length > 0) {
      const tier = vehicle.tieredPricing.find(t => t.hours === Number(body.durationHours));
      if (!tier) {
        return NextResponse.json({ error: 'Invalid duration selected for this vehicle.' }, { status: 400 });
      }
      finalPrice = tier.price; // always use server-side price when available
    }

    let originalPrice = finalPrice;
    let appliedCoupon = null;

    if (body.couponCode) {
      const coupon = await Coupon.findOne({ code: body.couponCode.trim().toUpperCase() });
      if (coupon && coupon.isActive && coupon.usedCount < coupon.usageLimit) {
        finalPrice = Math.max(0, finalPrice - (finalPrice * coupon.discountPercentage) / 100);
        appliedCoupon = coupon;
      } else {
        return NextResponse.json({ error: 'Invalid or inactive coupon code.' }, { status: 400 });
      }
    }

    // Attach user if logged in
    let userId = null;
    let customerEmail = null;
    const token = request.cookies.get('user_token')?.value;
    if (token) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        userId = payload.userId;
        customerEmail = payload.email || null;
      } catch { /* anonymous booking */ }
    }

    if (userId && !customerEmail) {
      const user = await User.findById(userId).select('email');
      customerEmail = user?.email || null;
    }

    const startDate = new Date(body.startDate);
    const endDate = calculateBookingEndDate(startDate, Number(body.durationHours));
    const conflict = await findConflictingBooking({
      vehicleId: body.vehicle,
      startDate,
      endDate,
    });

    if (conflict) {
      return NextResponse.json({
        error: 'This vehicle already has another booking for that time slot. Please choose a different date or duration.',
      }, { status: 409 });
    }

    const bookingData = {
      vehicle: body.vehicle,
      customerEmail,
      customerName: body.customerName,
      phone: body.phone,
      startDate,
      endDate,
      durationHours: Number(body.durationHours),
      totalPrice: finalPrice,
      originalPrice,
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      idCardImage: body.idCardImage,
      aadhaarCardImage: body.aadhaarCardImage,
      drivingLicenseImage: body.drivingLicenseImage,
      status: 'Pending',
      verificationPendingUntil: getVerificationExpiryDate(),
      slotKey: createBookingSlotKey(body.vehicle, startDate, endDate),
    };
    if (userId) bookingData.user = userId;

    let newBooking;
    try {
      newBooking = await Booking.create(bookingData);
    } catch (error) {
      if (error?.code === 11000) {
        return NextResponse.json({
          error: 'Another booking was just created for this exact time slot. Please pick a different time.',
        }, { status: 409 });
      }
      throw error;
    }

    if (appliedCoupon) {
      appliedCoupon.usedCount += 1;
      await appliedCoupon.save();
    }

    const baseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    try {
      await notifyAdminForNewBooking({
        booking: newBooking,
        vehicle,
        baseUrl,
      });
    } catch {
      // Booking creation should still succeed even if email delivery is unavailable.
    }

    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
