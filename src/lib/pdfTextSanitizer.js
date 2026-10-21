/**
 * Sanitizes any text string for safe, crisp rendering in standard jsPDF fonts (Helvetica).
 * Replaces Unicode arrows (which otherwise render as "!'"), currency symbols, smart quotes,
 * em-dashes, and emojis that cause jsPDF to switch to UTF-16 with ugly null-byte letter spaces.
 */
export function cleanForPdf(input) {
  if (input === null || input === undefined) return '';
  return String(input)
    // Convert all Unicode arrows to standard ASCII '->'
    .replace(/[→⇒➔➜➝➡►▸]/g, ' -> ')
    .replace(/[←⇐◄◂]/g, ' <- ')
    .replace(/[↔⇔]/g, ' <-> ')
    // Normalize spaces around arrows
    .replace(/\s*->\s*/g, ' -> ')
    .replace(/\s*<-\s*/g, ' <- ')
    // Currency: Replace ₹ with Rs.
    .replace(/₹/g, 'Rs. ')
    // Smart quotes & apostrophes -> ASCII
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u0060\u00B4]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F\u2033\u00AB\u00BB]/g, '"')
    // Dashes & Hyphens -> ASCII '-'
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212]/g, '-')
    // Bullets & Dots -> ASCII '*'
    .replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, '* ')
    .replace(/\u2026/g, '...')
    // Remove emojis & surrogate pairs
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '')
    // Strip non-printable / non-ASCII characters that force UTF-16
    .replace(/[^\x20-\x7E\r\n\t]/g, ' ')
    // Normalize line endings
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Collapse consecutive newlines to prevent blank lines between text
    .replace(/\n{2,}/g, '\n')
    // Normalize spaces
    .replace(/[ \t]+/g, ' ')
    .trim();
}
