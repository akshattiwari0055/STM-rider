import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Vehicle } from '@/models/Vehicle';

export async function GET() {
  try {
    await connectDB();
    
    const demoVehicles = [
      // --- CARS (10) ---
      { name: "Maruti Swift", type: "Car", pricePerDay: 1200, tieredPricing: [{ hours: 5, price: 599 }, { hours: 12, price: 899 }, { hours: 24, price: 1200 }, { hours: 168, price: 6999 }], image: "https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&q=80&w=800", status: "Available" },
      { name: "Hyundai i20", type: "Car", pricePerDay: 1400, tieredPricing: [{ hours: 5, price: 699 }, { hours: 12, price: 999 }, { hours: 24, price: 1400 }, { hours: 168, price: 7999 }], image: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&q=80&w=800", status: "Available" },
      { name: "Tata Nexon", type: "Car", pricePerDay: 1800, tieredPricing: [{ hours: 5, price: 899 }, { hours: 12, price: 1299 }, { hours: 24, price: 1800 }, { hours: 168, price: 9999 }], image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800", status: "Available" },
      { name: "Mahindra Thar (4x4)", type: "Car", pricePerDay: 3500, tieredPricing: [{ hours: 5, price: 1599 }, { hours: 12, price: 2499 }, { hours: 24, price: 3500 }, { hours: 168, price: 19999 }], image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800", status: "Available" },
      { name: "Hyundai Creta", type: "Car", pricePerDay: 2200, tieredPricing: [{ hours: 5, price: 999 }, { hours: 12, price: 1599 }, { hours: 24, price: 2200 }, { hours: 168, price: 12999 }], image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=800", status: "Available" },
      { name: "Maruti Baleno", type: "Car", pricePerDay: 1300, tieredPricing: [{ hours: 5, price: 649 }, { hours: 12, price: 949 }, { hours: 24, price: 1300 }, { hours: 168, price: 7499 }], image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800", status: "Available" },
      { name: "Kia Seltos", type: "Car", pricePerDay: 2400, tieredPricing: [{ hours: 5, price: 1099 }, { hours: 12, price: 1699 }, { hours: 24, price: 2400 }, { hours: 168, price: 13999 }], image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=800", status: "Available" },
      { name: "Honda City", type: "Car", pricePerDay: 2000, tieredPricing: [{ hours: 5, price: 899 }, { hours: 12, price: 1399 }, { hours: 24, price: 2000 }, { hours: 168, price: 11499 }], image: "https://images.unsplash.com/photo-1527247043589-98e6ac08f56c?auto=format&fit=crop&q=80&w=800", status: "Available" },
      { name: "Maruti WagonR", type: "Car", pricePerDay: 900, tieredPricing: [{ hours: 5, price: 399 }, { hours: 12, price: 699 }, { hours: 24, price: 900 }, { hours: 168, price: 4999 }], image: "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&q=80&w=800", status: "Available" },
      { name: "Toyota Fortuner", type: "Car", pricePerDay: 5500, tieredPricing: [{ hours: 5, price: 2499 }, { hours: 12, price: 3999 }, { hours: 24, price: 5500 }, { hours: 168, price: 32000 }], image: "https://images.unsplash.com/photo-1617469767053-d3b508a0d822?auto=format&fit=crop&q=80&w=800", status: "Available" },

      // --- BIKES (10) ---
      { name: "Royal Enfield Classic 350", type: "Bike", pricePerDay: 1000, tieredPricing: [{ hours: 5, price: 499 }, { hours: 12, price: 749 }, { hours: 24, price: 1000 }, { hours: 168, price: 5999 }], image: "https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&q=80&w=800", status: "Available" },
      { name: "Royal Enfield Himalayan", type: "Bike", pricePerDay: 1400, tieredPricing: [{ hours: 5, price: 699 }, { hours: 12, price: 999 }, { hours: 24, price: 1400 }, { hours: 168, price: 7999 }], image: "https://images.unsplash.com/photo-1614165933026-0750fcd503e8?auto=format&fit=crop&q=80&w=800", status: "Available" },
      { name: "Bajaj Pulsar NS200", type: "Bike", pricePerDay: 800, tieredPricing: [{ hours: 5, price: 399 }, { hours: 12, price: 599 }, { hours: 24, price: 800 }, { hours: 168, price: 4499 }], image: "https://images.unsplash.com/photo-1622185135505-2d795003994a?auto=format&fit=crop&q=80&w=800", status: "Available" },
      { name: "KTM Duke 250", type: "Bike", pricePerDay: 1200, tieredPricing: [{ hours: 5, price: 599 }, { hours: 12, price: 899 }, { hours: 24, price: 1200 }, { hours: 168, price: 6999 }], image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=800", status: "Available" },
      { name: "Yamaha R15 V4", type: "Bike", pricePerDay: 1100, tieredPricing: [{ hours: 5, price: 549 }, { hours: 12, price: 799 }, { hours: 24, price: 1100 }, { hours: 168, price: 6499 }], image: "https://images.unsplash.com/photo-1615172282427-99392f7a9944?auto=format&fit=crop&q=80&w=800", status: "Available" },
      { name: "Hero Splendor Plus", type: "Bike", pricePerDay: 500, tieredPricing: [{ hours: 5, price: 199 }, { hours: 12, price: 349 }, { hours: 24, price: 500 }, { hours: 168, price: 2999 }], image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800", status: "Available" },
      { name: "Bajaj Avenger 220", type: "Bike", pricePerDay: 900, tieredPricing: [{ hours: 5, price: 449 }, { hours: 12, price: 649 }, { hours: 24, price: 900 }, { hours: 168, price: 5299 }], image: "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&q=80&w=800", status: "Available" },
      { name: "TVS Apache RTR 160", type: "Bike", pricePerDay: 750, tieredPricing: [{ hours: 5, price: 349 }, { hours: 12, price: 549 }, { hours: 24, price: 750 }, { hours: 168, price: 4299 }], image: "https://images.unsplash.com/photo-1444491741275-3747c53c99b4?auto=format&fit=crop&q=80&w=800", status: "Available" },
      { name: "Honda CB Shine", type: "Bike", pricePerDay: 600, tieredPricing: [{ hours: 5, price: 249 }, { hours: 12, price: 449 }, { hours: 24, price: 600 }, { hours: 168, price: 3499 }], image: "https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&q=80&w=800", status: "Available" },
      { name: "Royal Enfield Bullet 350", type: "Bike", pricePerDay: 950, tieredPricing: [{ hours: 5, price: 449 }, { hours: 12, price: 699 }, { hours: 24, price: 950 }, { hours: 168, price: 5799 }], image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&q=80&w=800", status: "Available" },

      // --- SCOOTIES (5) ---
      { name: "Honda Activa 6G", type: "Scooty", pricePerDay: 500, tieredPricing: [{ hours: 5, price: 199 }, { hours: 12, price: 349 }, { hours: 24, price: 500 }, { hours: 168, price: 2800 }], image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800", status: "Available" },
      { name: "TVS Jupiter 125", type: "Scooty", pricePerDay: 550, tieredPricing: [{ hours: 5, price: 249 }, { hours: 12, price: 399 }, { hours: 24, price: 550 }, { hours: 168, price: 2999 }], image: "https://images.unsplash.com/photo-1485902701129-91703e7c810c?auto=format&fit=crop&q=80&w=800", status: "Available" },
      { name: "TVS Ntorq 125", type: "Scooty", pricePerDay: 650, tieredPricing: [{ hours: 5, price: 299 }, { hours: 12, price: 449 }, { hours: 24, price: 650 }, { hours: 168, price: 3499 }], image: "https://images.unsplash.com/photo-1591146746011-827b5e67049e?auto=format&fit=crop&q=80&w=800", status: "Available" },
      { name: "Suzuki Access 125", type: "Scooty", pricePerDay: 600, tieredPricing: [{ hours: 5, price: 249 }, { hours: 12, price: 399 }, { hours: 24, price: 600 }, { hours: 168, price: 3200 }], image: "https://images.unsplash.com/photo-1517406834242-7634242-7634242?auto=format&fit=crop&q=80&w=800", status: "Available" },
      { name: "Aprilia SR 160", type: "Scooty", pricePerDay: 800, tieredPricing: [{ hours: 5, price: 349 }, { hours: 12, price: 549 }, { hours: 24, price: 800 }, { hours: 168, price: 4499 }], image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=800", status: "Available" }
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

    return NextResponse.json({ success: true, count: results.length, vehicles: results });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
