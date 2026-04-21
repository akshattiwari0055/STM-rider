import { SignJWT, jwtVerify } from 'jose';
import { Booking } from '@/models/Booking';
import { User } from '@/models/User';
import { Vehicle } from '@/models/Vehicle';
import {
  sendAdminBookingReviewEmail,
  sendBookingApprovedEmail,
  sendVehicleReturnReminderEmail,
} from '@/lib/mailer';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key');
const PENDING_VERIFICATION_MINUTES = 30;
const RETURN_REMINDER_INTERVAL_MS = 60 * 60 * 1000;

export function calculateBookingEndDate(startDate, durationHours) {
  const start = new Date(startDate);
  const end = new Date(start);
  end.setHours(end.getHours() + Number(durationHours || 0));
  return end;
}

export function createBookingSlotKey(vehicleId, startDate, endDate) {
  return `${vehicleId}:${new Date(startDate).toISOString()}:${new Date(endDate).toISOString()}`;
}

export function getVerificationExpiryDate() {
  return new Date(Date.now() + PENDING_VERIFICATION_MINUTES * 60 * 1000);
}

export async function createBookingActionToken({ bookingId, action }) {
  return new SignJWT({
    bookingId,
    action,
    purpose: 'booking-admin-action',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('12h')
    .sign(JWT_SECRET);
}

export async function verifyBookingActionToken(token) {
  const { payload } = await jwtVerify(token, JWT_SECRET);
  if (payload.purpose !== 'booking-admin-action' || !payload.bookingId || !payload.action) {
    throw new Error('Invalid booking action token.');
  }
  return payload;
}

export async function clearVehicleIfNoActiveBookings(vehicleId) {
  if (!vehicleId) return;
  const otherActive = await Booking.findOne({
    vehicle: vehicleId,
    status: 'Active',
  });

  if (!otherActive) {
    await Vehicle.findByIdAndUpdate(vehicleId, { status: 'Available' });
  }
}

export async function expireStalePendingBookings() {
  const now = new Date();
  const staleBookings = await Booking.find({
    status: 'Pending',
    verificationPendingUntil: { $ne: null, $lte: now },
  }).select('_id vehicle');

  if (!staleBookings.length) {
    return;
  }

  const staleIds = staleBookings.map((booking) => booking._id);

  await Booking.updateMany(
    { _id: { $in: staleIds } },
    {
      $set: { status: 'Cancelled' },
      $unset: { slotKey: 1, verificationPendingUntil: 1 },
    }
  );

  const vehicleIds = [...new Set(staleBookings.map((booking) => booking.vehicle?.toString()).filter(Boolean))];
  for (const vehicleId of vehicleIds) {
    await clearVehicleIfNoActiveBookings(vehicleId);
  }
}

export async function autoCompleteActiveBookings() {
  return;
}

export async function cleanupBookingStates() {
  await expireStalePendingBookings();
  await autoCompleteActiveBookings();
}

export async function sendOverdueReturnReminders({ baseUrl }) {
  const now = new Date();
  const reminderCutoff = new Date(now.getTime() - RETURN_REMINDER_INTERVAL_MS);
  const overdueBookings = await Booking.find({
    status: 'Active',
    endDate: { $lte: now },
    $or: [
      { returnReminderLastSentAt: null },
      { returnReminderLastSentAt: { $lte: reminderCutoff } },
    ],
  }).populate('vehicle').populate('user');

  for (const booking of overdueBookings) {
    if (!booking.vehicle) {
      continue;
    }

    try {
      const returnToken = await createBookingActionToken({
        bookingId: booking._id.toString(),
        action: 'complete',
      });

      await sendVehicleReturnReminderEmail({
        booking,
        vehicle: booking.vehicle,
        customerEmail: booking.customerEmail || booking.user?.email,
        baseUrl,
        confirmReturnUrl: `${baseUrl}/api/admin/bookings/${booking._id}/decision?token=${encodeURIComponent(returnToken)}`,
      });

      booking.returnReminderLastSentAt = now;
      await booking.save();
    } catch (error) {
      console.error('[booking:return-reminder] failed', {
        bookingId: booking._id?.toString(),
        vehicleId: booking.vehicle?._id?.toString(),
        error: error?.message,
      });
    }
  }
}

export async function findConflictingBooking({ vehicleId, startDate, endDate, excludeBookingId = null }) {
  const now = new Date();
  const query = {
    vehicle: vehicleId,
    startDate: { $lt: endDate },
    endDate: { $gt: startDate },
    $or: [
      { status: 'Active' },
      { status: 'Pending', verificationPendingUntil: { $gt: now } },
    ],
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  return Booking.findOne(query);
}

async function resolveBookingForEmail(bookingId) {
  const booking = await Booking.findById(bookingId).populate('vehicle').populate('user');
  if (!booking) {
    throw new Error('Booking not found.');
  }
  return booking;
}

export async function applyBookingStatusTransition({ bookingId, nextStatus, baseUrl }) {
  await cleanupBookingStates();

  const booking = await resolveBookingForEmail(bookingId);
  if (!booking.vehicle) {
    throw new Error('Vehicle not found for this booking.');
  }

  const previousStatus = booking.status;
  if (previousStatus === nextStatus) {
    return { booking, changed: false };
  }

  if (nextStatus === 'Active') {
    const conflict = await findConflictingBooking({
      vehicleId: booking.vehicle._id,
      startDate: booking.startDate,
      endDate: booking.endDate || calculateBookingEndDate(booking.startDate, booking.durationHours),
      excludeBookingId: booking._id,
    });

    if (conflict) {
      throw new Error('This vehicle already has another booking for the same time slot.');
    }

    booking.status = 'Active';
    booking.approvedAt = new Date();
    booking.verificationPendingUntil = null;
    booking.returnReminderLastSentAt = null;
    booking.returnConfirmedAt = null;
    await booking.save();

    await Vehicle.findByIdAndUpdate(booking.vehicle._id, { status: 'Busy' });

    const customerEmail = booking.customerEmail || booking.user?.email;
    if (customerEmail) {
      await sendBookingApprovedEmail({
        booking,
        vehicle: booking.vehicle,
        customerEmail,
        customerName: booking.customerName,
        baseUrl,
      });
    }

    return { booking, changed: true };
  }

  if (nextStatus === 'Cancelled') {
    booking.status = 'Cancelled';
    booking.verificationPendingUntil = null;
    booking.slotKey = null;
    booking.returnReminderLastSentAt = null;
    await booking.save();
    await clearVehicleIfNoActiveBookings(booking.vehicle._id);
    return { booking, changed: true };
  }

  if (nextStatus === 'Completed') {
    booking.status = 'Completed';
    booking.verificationPendingUntil = null;
    booking.returnConfirmedAt = new Date();
    booking.returnReminderLastSentAt = null;
    booking.slotKey = null;
    await booking.save();
    await clearVehicleIfNoActiveBookings(booking.vehicle._id);
    return { booking, changed: true };
  }

  booking.status = nextStatus;
  await booking.save();
  return { booking, changed: true };
}

export async function notifyAdminForNewBooking({ booking, vehicle, baseUrl }) {
  const approveToken = await createBookingActionToken({
    bookingId: booking._id.toString(),
    action: 'approve',
  });
  const rejectToken = await createBookingActionToken({
    bookingId: booking._id.toString(),
    action: 'cancel',
  });

  await sendAdminBookingReviewEmail({
    booking,
    vehicle,
    customerEmail: booking.customerEmail,
    baseUrl,
    approveUrl: `${baseUrl}/api/admin/bookings/${booking._id}/decision?token=${encodeURIComponent(approveToken)}`,
    rejectUrl: `${baseUrl}/api/admin/bookings/${booking._id}/decision?token=${encodeURIComponent(rejectToken)}`,
  });
}
