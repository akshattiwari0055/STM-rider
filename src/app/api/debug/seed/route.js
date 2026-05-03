import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Vehicle } from '@/models/Vehicle';

export async function GET() {
  try {
    await connectDB();
    
    const demoVehicles = [
      {
        name: "Royal Enfield Classic 350",
        type: "Bike",
        pricePerDay: 999,
        tieredPricing: [
          { hours: 5, price: 499 },
          { hours: 12, price: 799 },
          { hours: 24, price: 999 },
          { hours: 168, price: 5499 }
        ],
        image: "https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&q=80&w=800",
        status: "Available"
      },
      {
        name: "Tata Punch",
        type: "Car",
        pricePerDay: 1999,
        tieredPricing: [
          { hours: 5, price: 999 },
          { hours: 12, price: 1499 },
          { hours: 24, price: 1999 },
          { hours: 168, price: 11999 }
        ],
        image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800",
        status: "Available"
      },
      {
        name: "Honda Activa 6G",
        type: "Scooty",
        pricePerDay: 599,
        tieredPricing: [
          { hours: 5, price: 299 },
          { hours: 12, price: 449 },
          { hours: 24, price: 599 },
          { hours: 168, price: 3499 }
        ],
        image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800",
        status: "Available"
      }
    ];

    const results = [];
    for (const v of demoVehicles) {
      const res = await Vehicle.findOneAndUpdate(
        { name: v.name },
        v,
        { upsert: true, new: true }
      );
      results.push(res);
    }

    return NextResponse.json({ success: true, vehicles: results });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
