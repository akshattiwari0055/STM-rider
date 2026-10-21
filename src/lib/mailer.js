import nodemailer from 'nodemailer';
import { jsPDF } from 'jspdf';

let transporterPromise;

function getTransporter() {
  if (!transporterPromise) {
    transporterPromise = Promise.resolve(
      nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })
    );
  }

  return transporterPromise;
}

async function sendMailWithLogging(transporter, mailOptions, label) {
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[mail:${label}] sent`, {
      to: mailOptions.to,
      subject: mailOptions.subject,
      messageId: info?.messageId,
      response: info?.response,
    });
    return info;
  } catch (error) {
    console.error(`[mail:${label}] failed`, {
      to: mailOptions.to,
      subject: mailOptions.subject,
      error: error?.message,
      stack: error?.stack,
    });
    throw error;
  }
}

export function isSmtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.MAIL_FROM
  );
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatCurrency(amount) {
  return `Rs. ${Number(amount || 0).toLocaleString('en-IN')}`;
}

function formatDateTime(value) {
  const date = new Date(value);
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function buildReceiptPdfBuffer({ booking, vehicle }) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const width = pdf.internal.pageSize.getWidth();
  const startDate = new Date(booking.startDate);
  const endDate = new Date(booking.endDate);

  pdf.setFillColor(255, 179, 0);
  pdf.rect(0, 0, width, 3, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(19);
  pdf.setTextColor(255, 106, 0);
  pdf.text('STM', 15, 20);
  pdf.setFontSize(10);
  pdf.setTextColor(21, 135, 194);
  pdf.text('RIDER', 15, 26);

  pdf.setTextColor(90, 90, 90);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.text('Confirmed Booking Receipt', 15, 32);

  pdf.setDrawColor(230, 230, 230);
  pdf.line(15, 36, width - 15, 36);

  pdf.setTextColor(130, 130, 130);
  pdf.setFontSize(9);
  pdf.text('BOOKING ID', 15, 40);
  pdf.text('STATUS', width - 45, 40);

  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(12);
  pdf.text(`#${booking._id.toString().slice(-10).toUpperCase()}`, 15, 47);
  pdf.setTextColor(22, 163, 74);
  pdf.text('APPROVED', width - 45, 47);

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(130, 130, 130);
  pdf.setFontSize(9);
  pdf.text('CUSTOMER', 15, 59);
  pdf.text('VEHICLE', 105, 59);

  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(13);
  pdf.text(booking.customerName, 15, 66);
  pdf.text(vehicle.name || 'Vehicle', 105, 66);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(90, 90, 90);
  pdf.text(booking.customerEmail || '', 15, 72);
  pdf.text(booking.phone || '', 15, 78);
  pdf.text(vehicle.type || '', 105, 72);

  pdf.setDrawColor(230, 230, 230);
  pdf.line(15, 86, width - 15, 86);

  pdf.setFontSize(9);
  pdf.setTextColor(130, 130, 130);
  pdf.text('PICKUP', 15, 96);
  pdf.text('DROP-OFF', 105, 96);

  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(11);
  pdf.text(formatDateTime(startDate), 15, 103);
  pdf.text(formatDateTime(endDate), 105, 103);

  pdf.setDrawColor(230, 230, 230);
  pdf.line(15, 110, width - 15, 110);

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(130, 130, 130);
  pdf.text('DURATION', 15, 120);
  pdf.text('TOTAL PAID', width - 15, 120, { align: 'right' });

  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(12);
  pdf.text(`${booking.durationHours} Hours`, 15, 127);
  pdf.setTextColor(255, 106, 0);
  pdf.setFontSize(18);
  pdf.text(formatCurrency(booking.totalPrice), width - 15, 127, { align: 'right' });

  pdf.setFontSize(9);
  pdf.setTextColor(150, 150, 150);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Thank you for choosing STM RIDER. Please carry your ID proofs at pickup.', width / 2, 142, { align: 'center' });

  pdf.setFillColor(255, 106, 0);
  pdf.rect(0, pdf.internal.pageSize.getHeight() - 3, width, 3, 'F');

  return Buffer.from(pdf.output('arraybuffer'));
}

export async function sendOtpEmail({ email, name, code, purpose }) {
  if (!isSmtpConfigured()) {
    throw new Error('SMTP is not configured. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and MAIL_FROM.');
  }

  const transporter = await getTransporter();
  const intro =
    purpose === 'login'
      ? 'Use this one-time code to finish signing in to STM RIDER.'
      : 'Use this one-time code to verify your email and finish creating your STM RIDER account.';

  await sendMailWithLogging(transporter, {
    from: process.env.MAIL_FROM,
    to: email,
    subject: purpose === 'login' ? 'Your STM RIDER login code' : 'Verify your STM RIDER email',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111827;background:#fff7ed;border:1px solid #fed7aa;border-radius:16px;">
        <p style="font-size:14px;margin:0 0 12px;color:#9a3412;">STM RIDER</p>
        <h1 style="margin:0 0 12px;font-size:24px;color:#111827;">Hello${name ? ` ${name}` : ''},</h1>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#374151;">${intro}</p>
        <div style="margin:0 0 20px;padding:18px 24px;background:#111827;border-radius:14px;text-align:center;">
          <span style="font-size:34px;font-weight:700;letter-spacing:8px;color:#fbbf24;">${code}</span>
        </div>
        <p style="margin:0 0 8px;font-size:14px;line-height:1.7;color:#4b5563;">This code expires in 10 minutes.</p>
        <p style="margin:0;font-size:13px;line-height:1.6;color:#6b7280;">If you did not request this, you can ignore this email.</p>
      </div>
    `,
  }, `otp-${purpose}`);
}

export async function sendAdminBookingReviewEmail({
  booking,
  vehicle,
  customerEmail,
  baseUrl,
  approveUrl,
  rejectUrl,
}) {
  if (!isSmtpConfigured()) {
    return;
  }

  const transporter = await getTransporter();
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER;
  const pickupTime = formatDateTime(booking.startDate);
  const dropoffTime = formatDateTime(booking.endDate);

  await sendMailWithLogging(transporter, {
    from: process.env.MAIL_FROM,
    to: adminEmail,
    subject: `New booking (Awaiting Approval): ${vehicle.name}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;padding:24px;color:#111827;background:#fffaf0;border:1px solid #fde68a;border-radius:18px;">
        <p style="font-size:13px;letter-spacing:0.14em;text-transform:uppercase;color:#b45309;margin:0 0 12px;">STM RIDER Admin</p>
        <h1 style="margin:0 0 12px;font-size:28px;color:#111827;">New Booking Pending Approval</h1>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#4b5563;">
          A customer has submitted a booking and made a manual payment. 
          Please verify their payment and approve or reject this booking.
        </p>

        <div style="background:#111827;color:#f9fafb;border-radius:16px;padding:18px 20px;margin-bottom:20px;">
          <p style="margin:0 0 8px;font-size:20px;font-weight:700;">${escapeHtml(vehicle.name)}</p>
          <p style="margin:0 0 6px;font-size:14px;color:#d1d5db;">Customer: ${escapeHtml(booking.customerName)}</p>
          <p style="margin:0 0 6px;font-size:14px;color:#d1d5db;">Email: ${escapeHtml(customerEmail || 'Not available')}</p>
          <p style="margin:0 0 6px;font-size:14px;color:#d1d5db;">Phone: ${escapeHtml(booking.phone)}</p>
          <p style="margin:0 0 6px;font-size:14px;color:#d1d5db;">Pickup: ${escapeHtml(pickupTime)}</p>
          <p style="margin:0 0 6px;font-size:14px;color:#d1d5db;">Drop-off: ${escapeHtml(dropoffTime)}</p>
          <p style="margin:0;font-size:16px;font-weight:700;color:#fbbf24;">Amount: ${escapeHtml(formatCurrency(booking.totalPrice))}</p>
        </div>

        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:18px;">
          <a href="${approveUrl}" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;padding:13px 22px;border-radius:999px;font-weight:700;">Approve Booking</a>
          <a href="${rejectUrl}" style="display:inline-block;background:#dc2626;color:#ffffff;text-decoration:none;padding:13px 22px;border-radius:999px;font-weight:700;">Reject Booking</a>
          <a href="${baseUrl}/admin/bookings" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:13px 22px;border-radius:999px;font-weight:700;">Open Admin Panel</a>
        </div>

        <p style="margin:0;font-size:13px;line-height:1.6;color:#6b7280;">
          The pending slot will auto-expire if it stays unapproved too long, so the vehicle does not remain blocked forever.
        </p>
      </div>
    `,
  }, 'admin-booking-review');
}

export async function sendBookingApprovedEmail({
  booking,
  vehicle,
  customerEmail,
  customerName,
}) {
  if (!isSmtpConfigured()) {
    return;
  }

  const transporter = await getTransporter();
  const receiptBuffer = buildReceiptPdfBuffer({ booking, vehicle });

  await sendMailWithLogging(transporter, {
    from: process.env.MAIL_FROM,
    to: customerEmail,
    subject: `Booking confirmed for ${vehicle.name}`,
    attachments: [
      {
        filename: `STM-RIDER-Receipt-${booking._id.toString().slice(-8).toUpperCase()}.pdf`,
        content: receiptBuffer,
        contentType: 'application/pdf',
      },
    ],
    html: `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;padding:24px;color:#111827;background:#fffaf0;border:1px solid #fde68a;border-radius:18px;">
        <p style="font-size:13px;letter-spacing:0.14em;text-transform:uppercase;color:#b45309;margin:0 0 12px;">STM RIDER</p>
        <h1 style="margin:0 0 12px;font-size:28px;color:#111827;">Your booking is confirmed.</h1>
        <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#4b5563;">
          Hello ${escapeHtml(customerName || booking.customerName)}, your booking has been approved by our admin team.
        </p>

        <div style="background:#111827;color:#f9fafb;border-radius:16px;padding:18px 20px;margin-bottom:20px;">
          <p style="margin:0 0 8px;font-size:20px;font-weight:700;">${escapeHtml(vehicle.name)}</p>
          <p style="margin:0 0 6px;font-size:14px;color:#d1d5db;">Pickup: ${escapeHtml(formatDateTime(booking.startDate))}</p>
          <p style="margin:0 0 6px;font-size:14px;color:#d1d5db;">Drop-off: ${escapeHtml(formatDateTime(booking.endDate))}</p>
          <p style="margin:0 0 6px;font-size:14px;color:#d1d5db;">Duration: ${escapeHtml(`${booking.durationHours} hours`)}</p>
          <p style="margin:0;font-size:16px;font-weight:700;color:#fbbf24;">Paid: ${escapeHtml(formatCurrency(booking.totalPrice))}</p>
        </div>

        <p style="margin:0 0 12px;font-size:14px;line-height:1.7;color:#4b5563;">
          We have attached your receipt PDF to this email. You can also view the confirmed booking from your dashboard.
        </p>
        <p style="margin:0;font-size:13px;line-height:1.6;color:#6b7280;">
          Please keep your ID proofs ready at pickup time. Have a safe ride.
        </p>
      </div>
    `,
  }, 'booking-approved');
}

export async function sendVehicleReturnReminderEmail({
  booking,
  vehicle,
  customerEmail,
  baseUrl,
  confirmReturnUrl,
}) {
  if (!isSmtpConfigured()) {
    return;
  }

  const transporter = await getTransporter();
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER;

  await sendMailWithLogging(transporter, {
    from: process.env.MAIL_FROM,
    to: adminEmail,
    subject: `Return check needed: ${vehicle.name}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;padding:24px;color:#111827;background:#fffaf0;border:1px solid #fde68a;border-radius:18px;">
        <p style="font-size:13px;letter-spacing:0.14em;text-transform:uppercase;color:#b45309;margin:0 0 12px;">STM RIDER Admin Reminder</p>
        <h1 style="margin:0 0 12px;font-size:28px;color:#111827;">Has this vehicle been returned?</h1>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#4b5563;">
          This rental has crossed its drop-off time and still needs admin confirmation before the vehicle becomes available again.
        </p>

        <div style="background:#111827;color:#f9fafb;border-radius:16px;padding:18px 20px;margin-bottom:20px;">
          <p style="margin:0 0 8px;font-size:20px;font-weight:700;">${escapeHtml(vehicle.name)}</p>
          <p style="margin:0 0 6px;font-size:14px;color:#d1d5db;">Customer: ${escapeHtml(booking.customerName)}</p>
          <p style="margin:0 0 6px;font-size:14px;color:#d1d5db;">Customer email: ${escapeHtml(customerEmail || 'Not available')}</p>
          <p style="margin:0 0 6px;font-size:14px;color:#d1d5db;">Phone: ${escapeHtml(booking.phone)}</p>
          <p style="margin:0 0 6px;font-size:14px;color:#d1d5db;">Drop-off time: ${escapeHtml(formatDateTime(booking.endDate))}</p>
          <p style="margin:0;font-size:16px;font-weight:700;color:#fbbf24;">Booking ID: #${escapeHtml(booking._id.toString().slice(-10).toUpperCase())}</p>
        </div>

        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:18px;">
          <a href="${confirmReturnUrl}" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;padding:13px 22px;border-radius:999px;font-weight:700;">Yes, mark returned</a>
          <a href="${baseUrl}/admin/bookings" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:13px 22px;border-radius:999px;font-weight:700;">Open Admin Panel</a>
        </div>

        <p style="margin:0;font-size:13px;line-height:1.6;color:#6b7280;">
          This reminder will continue to send every hour until the vehicle is marked returned by admin.
        </p>
      </div>
    `,
  }, 'vehicle-return-reminder');
}

export async function sendAdminInviteEmail({ email, inviteUrl, password }) {
  if (!isSmtpConfigured()) {
    throw new Error('SMTP is not configured.');
  }

  const transporter = await getTransporter();

  await sendMailWithLogging(transporter, {
    from: process.env.MAIL_FROM,
    to: email,
    subject: `Invitation to become an Admin at STM RIDER`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;padding:24px;color:#111827;background:#fffaf0;border:1px solid #fde68a;border-radius:18px;">
        <p style="font-size:13px;letter-spacing:0.14em;text-transform:uppercase;color:#b45309;margin:0 0 12px;">STM RIDER Super Admin</p>
        <h1 style="margin:0 0 12px;font-size:28px;color:#111827;">You've been invited!</h1>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#4b5563;">
          You have been granted Administrator access to the STM RIDER platform.
          Please click the button below to accept the invitation and activate your admin account.
        </p>

        ${password ? `
        <div style="margin:16px 0;font-size:15px;line-height:1.7;color:#1f2937;background:#f3f4f6;padding:16px;border-radius:12px;border:1px solid #e5e7eb;">
          <strong style="color:#111827;">Your Initial/Temporary Password:</strong> 
          <code style="font-family:monospace;font-size:16px;background:#e5e7eb;padding:3px 8px;border-radius:6px;color:#b45309;font-weight:bold;">${password}</code>
          <br/>
          <span style="font-size:12px;color:#6b7280;display:block;margin-top:6px;">You can change this password at any time from your account settings after logging in.</span>
        </div>
        ` : ''}

        <div style="margin-bottom:24px;margin-top:20px;">
          <a href="${inviteUrl}" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:999px;font-weight:700;font-size:16px;">Accept Admin Invitation</a>
        </div>

        <p style="margin:0;font-size:13px;line-height:1.6;color:#6b7280;">
          ${password ? 'Simply accept the invitation, and then log in using your email and the password above.' : 'If you don\'t have an account yet, you will need to sign up with this email address first.'}
          This link will expire in 24 hours.
        </p>
      </div>
    `,
  }, 'admin-invite');
}

export async function sendTripBookingApprovedEmail({
  booking,
  trip,
  customerEmail,
  customerName,
}) {
  if (!isSmtpConfigured()) {
    console.log('[mail:trip-booking-approved] SMTP not configured, skipping email.');
    return;
  }

  const transporter = await getTransporter();
  const { buildTripReceiptPdfBuffer } = await import('@/lib/tripReceipt');
  const receiptBuffer = buildTripReceiptPdfBuffer({ booking, trip });

  const itinerary = Array.isArray(trip?.itinerary) && trip.itinerary.length > 0 ? trip.itinerary : [];
  const inclusions = Array.isArray(trip?.inclusions) && trip.inclusions.length > 0 ? trip.inclusions : [];

  const itineraryHtml = itinerary.length > 0
    ? itinerary.map(item => `
        <div style="margin-bottom:12px;padding:12px 14px;background:#f8fafc;border-left:4px solid #f59e0b;border-radius:6px;">
          <strong style="color:#0f172a;font-size:14px;">Day ${escapeHtml(item.day)}: ${escapeHtml(item.title)}</strong>
          <p style="margin:4px 0 0;font-size:13px;line-height:1.6;color:#475569;">${escapeHtml(item.details)}</p>
        </div>
      `).join('')
    : '<p style="color:#64748b;font-size:13px;">Full daywise plan details are listed in your attached PDF voucher.</p>';

  const inclusionsHtml = inclusions.length > 0
    ? inclusions.map(inc => `<li style="margin-bottom:4px;color:#166534;font-size:13px;">${escapeHtml(inc)}</li>`).join('')
    : '<li style="color:#166534;font-size:13px;">Transport, Hotel Stay, Breakfast, Dinner & Sightseeing</li>';

  await sendMailWithLogging(transporter, {
    from: process.env.MAIL_FROM,
    to: customerEmail,
    subject: `🎉 Booking Confirmed: Your Trip to ${trip?.destination || trip?.title || 'Himachal'} with STM RIDER!`,
    attachments: [
      {
        filename: `STM-RIDER-Trip-Voucher-${booking._id.toString().slice(-8).toUpperCase()}.pdf`,
        content: receiptBuffer,
        contentType: 'application/pdf',
      },
    ],
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;padding:0;background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;overflow:hidden;">
        <!-- Header Banner -->
        <div style="background:linear-gradient(135deg, #111827 0%, #1f2937 100%);padding:28px 24px;text-align:center;border-bottom:4px solid #f59e0b;">
          <p style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#f59e0b;margin:0 0 8px;font-weight:700;">STM RIDER TOURS & EXPEDITIONS</p>
          <h1 style="margin:0;font-size:26px;font-weight:800;color:#ffffff;line-height:1.3;">Trip Booking Confirmed! 🎉</h1>
          <p style="margin:8px 0 0;font-size:14px;color:#94a3b8;">Payment Verified * Seat Officially Reserved</p>
        </div>

        <div style="padding:24px;">
          <!-- Warm Greeting -->
          <div style="margin-bottom:20px;">
            <p style="font-size:16px;color:#1e293b;margin:0 0 8px;"><strong>Hello ${escapeHtml(customerName || booking.customerName)},</strong></p>
            <p style="margin:0;font-size:14px;line-height:1.7;color:#475569;">
              Warm greetings from the entire <strong>STM RIDER</strong> team! We are thrilled to confirm your booking for <strong>${escapeHtml(trip?.title || 'Tour Expedition')}</strong>. Your payment has been verified by our admin team and your seats are reserved. Get ready for an unforgettable journey!
            </p>
          </div>

          <!-- Trip Overview Card -->
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:18px 20px;margin-bottom:24px;">
            <div style="display:flex;justify-content:space-between;border-bottom:1px solid #e2e8f0;padding-bottom:12px;margin-bottom:12px;">
              <div>
                <span style="font-size:11px;text-transform:uppercase;color:#64748b;font-weight:bold;">Trip Package</span>
                <p style="margin:2px 0 0;font-size:17px;font-weight:bold;color:#0f172a;">${escapeHtml(trip?.title || 'Tour')}</p>
              </div>
              <div style="text-align:right;">
                <span style="font-size:11px;text-transform:uppercase;color:#64748b;font-weight:bold;">Booking Ref</span>
                <p style="margin:2px 0 0;font-size:14px;font-weight:bold;color:#f59e0b;">#STM-TRIP-${escapeHtml(booking._id.toString().slice(-8).toUpperCase())}</p>
              </div>
            </div>

            <table style="width:100%;font-size:13px;color:#334155;border-collapse:collapse;">
              <tr>
                <td style="padding:6px 0;color:#64748b;">Destination:</td>
                <td style="padding:6px 0;font-weight:600;text-align:right;color:#0f172a;">${escapeHtml(trip?.destination || '')}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#64748b;">Duration:</td>
                <td style="padding:6px 0;font-weight:600;text-align:right;color:#0f172a;">${escapeHtml(trip?.duration || '')}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#64748b;">Departure Date:</td>
                <td style="padding:6px 0;font-weight:700;text-align:right;color:#d97706;">${escapeHtml(booking.departureDate)}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#64748b;">Pickup Point:</td>
                <td style="padding:6px 0;font-weight:600;text-align:right;color:#0f172a;">${escapeHtml(booking.pickupPoint || trip?.pickupLocation || 'LPU Law Gate')}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#64748b;">Travelers / Seats:</td>
                <td style="padding:6px 0;font-weight:600;text-align:right;color:#0f172a;">${escapeHtml(booking.numberOfSeats)} Person(s)</td>
              </tr>
              ${booking.couponCode ? `
              <tr>
                <td style="padding:6px 0;color:#16a34a;">Coupon Applied:</td>
                <td style="padding:6px 0;font-weight:600;text-align:right;color:#16a34a;">${escapeHtml(booking.couponCode.toUpperCase())}</td>
              </tr>
              ` : ''}
              <tr style="border-top:1px dashed #cbd5e1;">
                <td style="padding:10px 0 0;font-size:15px;font-weight:700;color:#0f172a;">Total Fare Paid:</td>
                <td style="padding:10px 0 0;font-size:18px;font-weight:800;text-align:right;color:#ea580c;">Rs. ${Number(booking.totalPrice || 0).toLocaleString('en-IN')}</td>
              </tr>
            </table>
          </div>

          <!-- Daywise Itinerary Highlights -->
          <div style="margin-bottom:24px;">
            <h3 style="margin:0 0 12px;font-size:15px;color:#0f172a;text-transform:uppercase;letter-spacing:0.05em;border-bottom:2px solid #f59e0b;padding-bottom:6px;display:inline-block;">
              📅 Day-by-Day Tour Plan
            </h3>
            ${itineraryHtml}
          </div>

          <!-- What's Included -->
          <div style="margin-bottom:24px;padding:16px 18px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;">
            <strong style="display:block;margin-bottom:8px;font-size:14px;color:#166534;">✓ What is Included in Your Trip:</strong>
            <ul style="margin:0;padding-left:18px;">
              ${inclusionsHtml}
            </ul>
          </div>

          <!-- Important Preparation & Checklist -->
          <div style="margin-bottom:24px;padding:16px 18px;background:#fffbeb;border:1px solid #fef08a;border-radius:12px;">
            <strong style="display:block;margin-bottom:8px;font-size:14px;color:#854d0e;">🎒 Important Things to Carry:</strong>
            <ul style="margin:0;padding-left:18px;font-size:13px;line-height:1.6;color:#713f12;">
              <li><strong>Original Govt Photo ID</strong> (Aadhaar Card, Passport, or Voter ID) - mandatory for hotel check-in.</li>
              <li>Warm clothes (jackets, thermal inners, gloves, caps) for mountain weather.</li>
              <li>Comfortable sports or trekking shoes.</li>
              <li>Personal water bottle and any essential medicines.</li>
            </ul>
          </div>

          <!-- Attached Receipt Info -->
          <div style="margin-bottom:24px;padding:14px 16px;background:#f1f5f9;border-radius:10px;text-align:center;">
            <p style="margin:0;font-size:13px;color:#475569;">
              📄 <strong>Official Voucher Attached:</strong> Your detailed PDF receipt with complete itinerary and payment voucher is attached to this email. You can also view or download it anytime from your <a href="https://stmrider.com/dashboard" style="color:#d97706;font-weight:bold;text-decoration:none;">Dashboard</a>.
            </p>
          </div>

          <!-- 24x7 Assistance -->
          <div style="border-top:1px solid #e2e8f0;padding-top:18px;font-size:13px;line-height:1.6;color:#64748b;">
            <p style="margin:0 0 6px;">Need help or have questions about departure timings?</p>
            <p style="margin:0;color:#0f172a;">
              <strong>Trip Captain & Helpline:</strong> <a href="tel:+919465853502" style="color:#ea580c;text-decoration:none;font-weight:bold;">+91 94658 53502</a> |
              <strong>WhatsApp:</strong> <a href="https://wa.me/919465853502" style="color:#16a34a;text-decoration:none;font-weight:bold;">Chat with us</a>
            </p>
          </div>
        </div>

        <!-- Email Footer -->
        <div style="background:#f8fafc;padding:16px 24px;border-top:1px solid #e2e8f0;text-align:center;font-size:12px;color:#94a3b8;">
          <p style="margin:0;">STM RIDER * Law Gate, Lovely Professional University, Phagwara, Punjab</p>
          <p style="margin:4px 0 0;">Visit us at <a href="https://stmrider.com" style="color:#f59e0b;text-decoration:none;">stmrider.com</a></p>
        </div>
      </div>
    `,
  }, 'trip-booking-approved');
}

