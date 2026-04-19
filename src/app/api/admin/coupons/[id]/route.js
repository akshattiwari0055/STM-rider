import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Coupon } from '@/models/Coupon';

export async function PATCH(request, context) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    await connectDB();
    const coupon = await Coupon.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json(coupon);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const { id } = await context.params;
    await connectDB();
    await Coupon.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
