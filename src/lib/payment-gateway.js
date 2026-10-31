import { ImapFlow } from 'imapflow';

/**
 * Generates a unique paise suffix (01–97) derived from the booking ID.
 * This makes each booking's payment amount unique so we can identify it
 * in the bank credit alert email without any payment gateway.
 *
 * Example: baseAmount=500, bookingId="abc123" → 500.47
 */
export function generateUniqueAmount(baseAmount, bookingId) {
  const idStr = bookingId.toString();
  let hash = 5381;
  for (let i = 0; i < idStr.length; i++) {
    hash = ((hash << 5) + hash) ^ idStr.charCodeAt(i);
    hash = hash & 0x7fffffff; // keep positive
  }
  const paise = (hash % 97) + 1; // 1–97 (avoid .98/.99 some apps round)
  return parseFloat((Number(baseAmount) + paise / 100).toFixed(2));
}

/**
 * Builds a standard UPI payment deep link pre-filled with the exact amount.
 * Works with PhonePe, GPay, Paytm and any UPI app that handles deep links.
 */
export function generateUPILink({ amount, bookingRef }) {
  const upiId   = process.env.MERCHANT_UPI_ID   || 'merchant@upi';
  const name    = process.env.MERCHANT_NAME      || 'STM RIDER';
  const note    = `STM RIDER #${bookingRef}`;
  return (
    `upi://pay?pa=${encodeURIComponent(upiId)}` +
    `&pn=${encodeURIComponent(name)}` +
    `&am=${amount}` +
    `&cu=INR` +
    `&tn=${encodeURIComponent(note)}`
  );
}

/**
 * Returns a dynamic QR code image URL for the given UPI link.
 * Uses the free & public api.qrserver.com — no API key needed.
 */
export function generateQRImageURL(upiLink) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(upiLink)}`;
}

/**
 * Connects to Gmail via IMAP and searches the last 48 hours of inbox emails
 * for any message whose body contains the unique amount string (e.g. "500.47").
 *
 * Bank credit alert emails from SBI / HDFC / ICICI / Axis / PNB all include
 * the exact credited amount in the email body, so this reliably detects payment.
 *
 * @param {number} uniqueAmount  e.g. 500.47
 * @returns {Promise<boolean>}   true if a matching credit alert was found
 */
export async function detectPaymentInGmail(uniqueAmount) {
  const amountStr = uniqueAmount.toFixed(2); // "500.47"

  const client = new ImapFlow({
    host:   process.env.BANK_IMAP_HOST || 'imap.gmail.com',
    port:   Number(process.env.BANK_IMAP_PORT || 993),
    secure: true,
    auth: {
      user: process.env.BANK_ALERT_EMAIL      || process.env.SMTP_USER,
      pass: process.env.BANK_ALERT_EMAIL_PASS || process.env.SMTP_PASS,
    },
    logger: false,
    tls: { rejectUnauthorized: false },
    connectionTimeout: 8000,
    greetingTimeout: 5000,
  });

  await client.connect();

  const lock = await client.getMailboxLock('INBOX');
  try {
    const since = new Date(Date.now() - 48 * 60 * 60 * 1000);

    // Search for emails whose body contains the exact amount string
    const uids = await client.search({ since, body: amountStr }, { uid: true });
    return uids.length > 0;
  } finally {
    lock.release();
    try { await client.logout(); } catch { /* ignore */ }
  }
}
