import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Trip } from '@/models/Trip';

const INITIAL_SEEDS = [
  {
    title: 'Shimla Snow & Heritage Getaway',
    destination: 'Shimla & Kufri, Himachal Pradesh',
    price: 3499,
    originalPrice: 4999,
    duration: '3 Days / 2 Nights',
    departureDates: ['Every Weekend (Fri - Sun)', '24 Oct 2026', '31 Oct 2026', '07 Nov 2026'],
    pickupLocation: 'LPU Law Gate / Chandigarh / Ambala',
    dropLocation: 'LPU Law Gate / Chandigarh',
    seatsTotal: 20,
    seatsAvailable: 14,
    image: 'https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1605649487212-47bdab064df8?auto=format&fit=crop&w=1200&q=80',
    ],
    description: 'Escape to the Queen of Hills with STM Rider! Experience colonial charm, scenic Himalayan views, snow activities in Kufri, pleasant strolls along Mall Road and The Ridge, and memorable bonfires with like-minded travelers.',
    itinerary: [
      {
        day: 1,
        title: 'Overnight Journey & Shimla Sightseeing',
        details: 'Early morning pickup from LPU Law Gate / Chandigarh. Scenic mountain drive to Shimla. Check-in to hotel, freshen up, and head to The Ridge, Mall Road, Christ Church, and Lakkar Bazaar. Enjoy dinner with a mountain view.',
      },
      {
        day: 2,
        title: 'Kufri Snow Excursion & Adventure Fun',
        details: 'Hearty breakfast followed by an excursion to Kufri. Enjoy snow views, horse riding, go-karting, and local sights. Return to Shimla in the evening for an acoustic musical session and dinner.',
      },
      {
        day: 3,
        title: 'Jakhoo Hill & Journey Back',
        details: 'Visit the iconic Jakhoo Temple atop Shimla highest peak. Leisurely shopping on Mall Road. Board the return vehicle with wonderful memories and arrive back by late evening.',
      },
    ],
    inclusions: [
      'Comfortable Travel in AC Luxury Traveler / SUV',
      '2 Nights Stay in 3-Star Resort / Hotel (Quad/Triple Sharing)',
      '2 Breakfasts & 2 Dinners included',
      'Sightseeing of Shimla, Kufri & Mall Road',
      'Experienced Trip Captain & 24x7 Assistance',
      'Bonfire & Evening Music Night (weather permitting)',
    ],
    exclusions: [
      'Lunches & Personal expenses',
      'Adventure activity charges (Skiing, Zipline, Horse riding)',
      'Entry tickets or monuments if any',
      'Anything not mentioned under inclusions',
    ],
    status: 'Open',
    featured: true,
  },
  {
    title: 'Manali & Solang Valley Explorer',
    destination: 'Manali, Solang Valley & Atal Tunnel',
    price: 4499,
    originalPrice: 6299,
    duration: '4 Days / 3 Nights',
    departureDates: ['Every Thursday Evening', '29 Oct 2026', '05 Nov 2026'],
    pickupLocation: 'LPU Law Gate / Jalandhar / Chandigarh',
    dropLocation: 'LPU Law Gate / Chandigarh',
    seatsTotal: 18,
    seatsAvailable: 8,
    image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df8?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1605649487212-47bdab064df8?auto=format&fit=crop&w=1200&q=80',
    ],
    description: 'The ultimate Himachal adventure! Explore Hadimba Temple, Old Manali cafes, snow games at Solang Valley, drive through the historic Atal Tunnel into Sissu (Lahaul Valley), and chill by the Beas River.',
    itinerary: [
      {
        day: 1,
        title: 'Departure & Arrival in Manali',
        details: 'Overnight journey through the mountains. Check-in to riverside hotel, relax, and explore Old Manali cafe culture and Hadimba Temple.',
      },
      {
        day: 2,
        title: 'Solang Valley & Atal Tunnel Adventure',
        details: 'Full day adventure trip to Solang Valley and through Atal Tunnel to Sissu waterfall. Snow activities, paragliding, and cable car options.',
      },
      {
        day: 3,
        title: 'Jogini Waterfall Trek & Mall Road',
        details: 'Scenic nature trek to Jogini Waterfall, followed by Vashisht Hot Springs. Evening shopping and cafes at Mall Road.',
      },
      {
        day: 4,
        title: 'River Rafting & Return Journey',
        details: 'White water river rafting in Kullu (optional) and scenic return drive with memorable group snapshots.',
      },
    ],
    inclusions: [
      'Roundtrip AC Transportation',
      'Hotel Stay with River / Valley View',
      'Daily Breakfast & Dinner',
      'Sightseeing covering Atal Tunnel, Sissu & Solang',
      'Dedicated Tour Manager',
    ],
    exclusions: [
      'Adventure sports fees',
      'Personal cafe meals & shopping',
    ],
    status: 'Filling Fast',
    featured: true,
  },
  {
    title: 'Kasol & Tosh Hippie Trail',
    destination: 'Parvati Valley, Kasol & Tosh',
    price: 3699,
    originalPrice: 5199,
    duration: '3 Days / 2 Nights',
    departureDates: ['Every Friday', '30 Oct 2026', '06 Nov 2026'],
    pickupLocation: 'LPU Law Gate / Chandigarh',
    dropLocation: 'LPU Law Gate / Chandigarh',
    seatsTotal: 16,
    seatsAvailable: 11,
    image: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=1200&q=80',
    ],
    description: 'Immerse in the magic of Parvati Valley! Stroll through Kasol Israeli cafes, visit Manikaran Sahib Gurudwara hot springs, and trek to the picturesque village of Tosh.',
    itinerary: [
      {
        day: 1,
        title: 'Arrival in Kasol & Chalal Trail',
        details: 'Arrive in Kasol, check-in to camps by the Parvati river. Walk along the Chalal pine trail, visit German bakeries, and enjoy a riverside bonfire.',
      },
      {
        day: 2,
        title: 'Tosh Village Trek & Snow Peak Views',
        details: 'Scenic drive to Barshaini and trek up to Tosh. Mesmerizing snow peak views, vibrant local wooden houses, and cozy mountain cafe vibes.',
      },
      {
        day: 3,
        title: 'Manikaran Sahib & Return Journey',
        details: 'Visit Manikaran Gurudwara and holy hot springs. Begin return journey and arrive back by night.',
      },
    ],
    inclusions: [
      'Transportation to and fro',
      'Riverside Camps / Homestay accommodation',
      'Breakfasts and Dinners included',
      'Bonfire and stargazing night',
      'Guided trek to Tosh',
    ],
    exclusions: [
      'Personal food & beverages',
      'Porter or luggage charges',
    ],
    status: 'Open',
    featured: true,
  },
];

export async function GET(request) {
  try {
    await connectDB();

    // Auto-seed if collection is empty
    const count = await Trip.countDocuments();
    if (count === 0) {
      await Trip.insertMany(INITIAL_SEEDS);
    }

    const { searchParams } = new URL(request.url);
    const featuredOnly = searchParams.get('featured') === 'true';
    const status = searchParams.get('status');

    let query = {};
    if (featuredOnly) query.featured = true;
    if (status) query.status = status;

    const trips = await Trip.find(query).sort({ featured: -1, createdAt: -1 });
    return NextResponse.json(trips);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body.title || !body.destination || !body.price || !body.duration || !body.image) {
      return NextResponse.json({ error: 'Title, destination, price, duration, and image are required.' }, { status: 400 });
    }

    const trip = await Trip.create({
      title: body.title,
      destination: body.destination,
      price: Number(body.price),
      originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
      duration: body.duration,
      departureDates: Array.isArray(body.departureDates) ? body.departureDates : (body.departureDates ? [body.departureDates] : []),
      pickupLocation: body.pickupLocation || 'LPU Law Gate / Chandigarh',
      dropLocation: body.dropLocation || 'LPU Law Gate / Chandigarh',
      seatsTotal: Number(body.seatsTotal || 20),
      seatsAvailable: Number(body.seatsAvailable ?? body.seatsTotal ?? 20),
      image: body.image,
      images: Array.isArray(body.images) ? body.images : [],
      description: body.description || '',
      itinerary: Array.isArray(body.itinerary) ? body.itinerary : [],
      inclusions: Array.isArray(body.inclusions) ? body.inclusions : [],
      exclusions: Array.isArray(body.exclusions) ? body.exclusions : [],
      thingsToCarry: Array.isArray(body.thingsToCarry) ? body.thingsToCarry : [],
      cancellationPolicy: Array.isArray(body.cancellationPolicy) ? body.cancellationPolicy : [],
      termsAndConditions: Array.isArray(body.termsAndConditions) ? body.termsAndConditions : [],
      status: body.status || 'Open',
      featured: Boolean(body.featured ?? true),
    });

    return NextResponse.json(trip, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
