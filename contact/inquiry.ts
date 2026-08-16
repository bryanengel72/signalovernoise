/**
 * Inquiry — a contact-form submission.
 *
 * The shape and its rules used to be declared twice: the browser built the
 * payload from four `FormData` reads, and the function re-derived it from an
 * untyped `Record<string, unknown>`. Nothing linked the two but string
 * matching. This module is now the single definition, imported by both sides.
 *
 * Framework-free — compiled by Vite into the browser bundle and by Vercel into
 * the function, same as `content/`.
 */

export type Inquiry = {
  name: string;
  email: string;
  company: string;
  message: string;
};

/** What the browser POSTs: an Inquiry plus the two anti-automation fields. */
export type InquiryRequest = Inquiry & {
  /** Honeypot — a hidden field only automation fills in. */
  website: string;
  turnstileToken: string;
};

export const FIELD_LIMITS = {
  name: 100,
  email: 200,
  company: 120,
  message: 5000,
  website: 200,
  turnstileToken: 4096,
} as const;

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Trim and truncate an untrusted value. Anything that is not a string becomes ''. */
export const cleanField = (value: unknown, max: number): string =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

/** Pull an Inquiry out of an untrusted payload. Never throws. */
export const cleanInquiry = (payload: Record<string, unknown>): Inquiry => ({
  name: cleanField(payload.name, FIELD_LIMITS.name),
  email: cleanField(payload.email, FIELD_LIMITS.email),
  company: cleanField(payload.company, FIELD_LIMITS.company),
  message: cleanField(payload.message, FIELD_LIMITS.message),
});

export type InquiryProblem = 'missing-name' | 'invalid-email' | 'missing-message';

/**
 * The rules an Inquiry must satisfy. Turnstile is the spam gate, so these stay
 * limited to genuinely empty or malformed input and name the field that failed.
 *
 * Both sides call this. The browser calls it to skip a pointless round-trip;
 * the function calls it because a client-side check is not a gate.
 */
export const validateInquiry = (inquiry: Inquiry): InquiryProblem | null => {
  if (!inquiry.name) return 'missing-name';
  if (!EMAIL_PATTERN.test(inquiry.email)) return 'invalid-email';
  if (!inquiry.message) return 'missing-message';
  return null;
};
