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
  pdf.setFontSize(20);
  pdf.setTextColor(0, 0, 0);
  pdf.text('STM', 15, 20);
  pdf.setTextColor(255, 106, 0);
  pdf.text('Riders', 31, 20);

  pdf.setTextColor(90, 90, 90);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.text('Confirmed Booking Receipt', 15, 26);

  pdf.setDrawColor(230, 230, 230);
  pdf.line(15, 31, width - 15, 31);

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
  pdf.text('Thank you for choosing STM Riders. Please carry your ID proofs at pickup.', width / 2, 142, { align: 'center' });

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
      ? 'Use this one-time code to finish signing in to STM Riders.'
      : 'Use this one-time code to verify your email and finish creating your STM Riders account.';

  await sendMailWithLogging(transporter, {
    from: process.env.MAIL_FROM,
    to: email,
    subject: purpose === 'login' ? 'Your STM Riders login code' : 'Verify your STM Riders email',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111827;background:#fff7ed;border:1px solid #fed7aa;border-radius:16px;">
        <p style="font-size:14px;margin:0 0 12px;color:#9a3412;">STM Riders</p>
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
    subject: `New booking awaiting approval: ${vehicle.name}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;padding:24px;color:#111827;background:#fffaf0;border:1px solid #fde68a;border-radius:18px;">
        <p style="font-size:13px;letter-spacing:0.14em;text-transform:uppercase;color:#b45309;margin:0 0 12px;">STM Riders Admin</p>
        <h1 style="margin:0 0 12px;font-size:28px;color:#111827;">A booking needs your review.</h1>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#4b5563;">
          The customer has completed the booking flow and is now waiting for admin verification.
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
        filename: `STM-Riders-Receipt-${booking._id.toString().slice(-8).toUpperCase()}.pdf`,
        content: receiptBuffer,
        contentType: 'application/pdf',
      },
    ],
    html: `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;padding:24px;color:#111827;background:#fffaf0;border:1px solid #fde68a;border-radius:18px;">
        <p style="font-size:13px;letter-spacing:0.14em;text-transform:uppercase;color:#b45309;margin:0 0 12px;">STM Riders</p>
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
        <p style="font-size:13px;letter-spacing:0.14em;text-transform:uppercase;color:#b45309;margin:0 0 12px;">STM Riders Admin Reminder</p>
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
