import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Coupon } from '@/models/Coupon';

export async function GET() {
  try {
    await connectDB();
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return NextResponse.json(coupons);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { code, discountPercentage, usageLimit } = await request.json();
    await connectDB();
    
    // Check if code exists
    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 });
    }

    const newCoupon = await Coupon.create({
      code: code.toUpperCase(),
      discountPercentage: Number(discountPercentage),
      usageLimit: Number(usageLimit)
    });

    return NextResponse.json(newCoupon, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
