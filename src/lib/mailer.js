import nodemailer from 'nodemailer';

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

export function isSmtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.MAIL_FROM
  );
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

  await transporter.sendMail({
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
  });
}
