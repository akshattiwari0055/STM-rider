import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Coupon } from '@/models/Coupon';

export async function POST(request) {
  try {
    const { code } = await request.json();
    if (!code) return NextResponse.json({ error: 'Code is required' }, { status: 400 });

    await connectDB();
    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });

    if (!coupon) return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 });
    if (!coupon.isActive) return NextResponse.json({ error: 'This coupon is inactive' }, { status: 400 });
    if (coupon.usedCount >= coupon.usageLimit) return NextResponse.json({ error: 'This coupon usage limit has been reached' }, { status: 400 });

    return NextResponse.json({ 
      valid: true, 
      discountPercentage: coupon.discountPercentage,
      code: coupon.code
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
