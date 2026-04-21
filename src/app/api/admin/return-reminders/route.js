import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import {
  cleanupBookingStates,
  sendOverdueReturnReminders,
} from '@/lib/booking-workflow';

function isAuthorized(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return true;
  }

  const headerToken = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  return headerToken === secret;
}

export async function GET(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const baseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    await cleanupBookingStates();
    await sendOverdueReturnReminders({ baseUrl });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
