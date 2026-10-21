import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Trip } from '@/models/Trip';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const trip = await Trip.findById(id);
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found.' }, { status: 404 });
    }
    return NextResponse.json(trip);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const body = await request.json();

    const updated = await Trip.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json({ error: 'Trip not found.' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const deleted = await Trip.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Trip not found.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Trip deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
