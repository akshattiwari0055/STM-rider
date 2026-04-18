import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Vehicle } from '@/models/Vehicle';
import { Booking } from '@/models/Booking';

export const dynamic = 'force-dynamic';

const defaultVehicles = [
  // ─── CARS ────────────────────────────────────────────────────────────────
  { name: 'Kia Carens', type: 'Car', pricePerDay: 1999, image: '/images/kia_carens.png', status: 'Available', tieredPricing: [{ hours: 5, price: 1999 }, { hours: 12, price: 3499 }, { hours: 24, price: 3500 }] },
  { name: 'Bolero Neo', type: 'Car', pricePerDay: 1399, image: '/images/bolero_neo.png', status: 'Available', tieredPricing: [{ hours: 5, price: 1399 }, { hours: 12, price: 1999 }, { hours: 24, price: 3000 }] },
  { name: 'Tata Punch', type: 'Car', pricePerDay: 999, image: '/images/tata_punch.png', status: 'Available', tieredPricing: [{ hours: 5, price: 999 }, { hours: 12, price: 1399 }, { hours: 24, price: 2000 }] },
  { name: 'i20 Sportz', type: 'Car', pricePerDay: 1399, image: '/images/hyundai_i20.png', status: 'Available', tieredPricing: [{ hours: 5, price: 1399 }, { hours: 12, price: 1999 }, { hours: 24, price: 1999 }] },
  { name: 'Ciaz Hybrid', type: 'Car', pricePerDay: 999, image: '/images/maruti_ciaz.png', status: 'Available', tieredPricing: [{ hours: 5, price: 999 }, { hours: 12, price: 1499 }, { hours: 24, price: 2298 }] },
  { name: 'Thar (Top Model)', type: 'Car', pricePerDay: 2000, image: '/images/mahindra_thar.png', status: 'Available', tieredPricing: [{ hours: 5, price: 2000 }, { hours: 12, price: 3500 }, { hours: 24, price: 3500 }] },
  { name: 'Tata Tiago', type: 'Car', pricePerDay: 899, image: '/images/tata_punch.png', status: 'Available', tieredPricing: [{ hours: 5, price: 899 }, { hours: 12, price: 1399 }, { hours: 24, price: 1999 }] },
  // ─── BIKES ───────────────────────────────────────────────────────────────
  { name: 'Royal Enfield (2019)', type: 'Bike', pricePerDay: 399, image: '/images/classic_350.png', status: 'Available', tieredPricing: [{ hours: 3, price: 399 }, { hours: 12, price: 799 }, { hours: 24, price: 999 }] },
  { name: 'Himalayan', type: 'Bike', pricePerDay: 799, image: '/images/royal_enfield_himalayan.png', status: 'Available', tieredPricing: [{ hours: 3, price: 799 }, { hours: 12, price: 1299 }, { hours: 24, price: 1299 }] },
  { name: 'Hunter (Top Model)', type: 'Bike', pricePerDay: 700, image: '/images/royal_enfield_hunter.png', status: 'Available', tieredPricing: [{ hours: 3, price: 700 }, { hours: 12, price: 1100 }, { hours: 24, price: 1100 }] },
  { name: 'Royal Enfield Meteor 350', type: 'Bike', pricePerDay: 700, image: '/images/royal_enfield_meteor.png', status: 'Available', tieredPricing: [{ hours: 3, price: 700 }, { hours: 12, price: 1200 }, { hours: 24, price: 1200 }] },
  { name: 'FZS Version 3', type: 'Bike', pricePerDay: 399, image: '/images/yamaha_fz.png', status: 'Available', tieredPricing: [{ hours: 3, price: 399 }, { hours: 12, price: 699 }, { hours: 24, price: 999 }] },
  { name: 'FZS Black', type: 'Bike', pricePerDay: 399, image: '/images/yamaha_fz.png', status: 'Available', tieredPricing: [{ hours: 3, price: 399 }, { hours: 12, price: 699 }, { hours: 24, price: 999 }] },
  // ─── SCOOTERS ─────────────────────────────────────────────────────────────
  { name: 'Activa 6G (New)', type: 'Scooty', pricePerDay: 499, image: '/images/honda_activa.png', status: 'Available', tieredPricing: [{ hours: 3, price: 499 }, { hours: 12, price: 799 }, { hours: 24, price: 799 }] },
  { name: 'Activa 6G', type: 'Scooty', pricePerDay: 299, image: '/images/honda_activa.png', status: 'Available', tieredPricing: [{ hours: 3, price: 299 }, { hours: 12, price: 499 }, { hours: 24, price: 799 }] },
];

/**
 * Auto-expire bookings whose rental period has ended.
 * Handles both old-format bookings (endDate) and new-format (startDate + durationHours).
 */
async function autoExpireBookings() {
  try {
    const now = new Date();
    const activeBookings = await Booking.find({ status: 'Active' }).populate('vehicle');

    for (const booking of activeBookings) {
      // Determine the drop-off time from whichever field is available
      let dropoff = null;

      if (booking.durationHours && booking.startDate) {
        dropoff = new Date(booking.startDate);
        dropoff.setHours(dropoff.getHours() + booking.durationHours);
      } else if (booking.endDate) {
        // Legacy bookings that used endDate
        dropoff = new Date(booking.endDate);
      }

      // If we can determine the end time and it has passed → expire
      if (dropoff && dropoff <= now) {
        booking.status = 'Completed';
        await booking.save();

        // Only restore vehicle if no other active booking is using it
        if (booking.vehicle) {
          const otherActive = await Booking.findOne({
            vehicle: booking.vehicle._id,
            status: 'Active',
            _id: { $ne: booking._id },
          });
          if (!otherActive) {
            await Vehicle.findByIdAndUpdate(booking.vehicle._id, { status: 'Available' });
          }
        }
      }
    }
  } catch {
    // Silently skip — never block the main response
  }
}

/**
 * Seed vehicles by UPSERTING — vehicles are matched by name.
 * Existing vehicles keep their _id and Busy/Available status.
 * Missing tieredPricing gets patched in without deleting anything.
 * NEW vehicles from the default list are inserted if not found.
 */
async function seedVehiclesIfNeeded() {
  const count = await Vehicle.countDocuments();

  if (count === 0) {
    // Fresh DB — insert all defaults
    await Vehicle.insertMany(defaultVehicles);
    return;
  }

  // Incrementally patch: add missing vehicles, update missing tieredPricing
  for (const dv of defaultVehicles) {
    const existing = await Vehicle.findOne({ name: dv.name });

    if (!existing) {
      // New vehicle in defaults that isn't in DB yet
      await Vehicle.create(dv);
    } else if (!existing.tieredPricing || existing.tieredPricing.length === 0) {
      // Existing vehicle missing tieredPricing — patch it (keep ID and status)
      await Vehicle.findByIdAndUpdate(existing._id, {
        tieredPricing: dv.tieredPricing,
        pricePerDay: dv.pricePerDay,
      });
    }
  }
}

export async function GET() {
  try {
    await connectDB();
    await seedVehiclesIfNeeded();
    await autoExpireBookings();

    const vehicles = await Vehicle.find().sort({ createdAt: 1 });
    return NextResponse.json(vehicles);
  } catch (error) {
    const fallback = defaultVehicles.map((v, i) => ({ ...v, _id: `fallback_${i}` }));
    return NextResponse.json(fallback);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    await connectDB();
    const newVehicle = await Vehicle.create(body);
    return NextResponse.json(newVehicle, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
