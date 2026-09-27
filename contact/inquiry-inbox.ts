import type { Inquiry } from './inquiry.js';

/**
 * InquiryInbox — the seam in front of Resend.
 *
 * Delivering an Inquiry means getting it in front of a person: it is emailed to
 * the consultancy's own address, with Reply-To set to the visitor so answering
 * is one click. There is no database; the inbox is the record.
 *
 * Two adapters justify the seam: `resendInquiryInbox` sends through the Resend
 * REST API in production, `inMemoryInquiryInbox` collects Inquiries in an array
 * in tests.
 */

const RESEND_EMAILS_URL = 'https://api.resend.com/emails';

/** A slow provider must not hold the function open; the visitor is waiting. */
const SEND_TIMEOUT_MS = 8000;

/** A discriminated union: `if (!result.ok)` narrows, so `error` is only reachable when it exists. */
export type DeliveryResult = { ok: true } | { ok: false; error: unknown };

export type InquiryInbox = {
  deliver: (inquiry: Inquiry) => Promise<DeliveryResult>;
};

/** Header values must be single-line; a name is visitor-supplied. */
const oneLine = (value: string) => value.replace(/[\r\n]+/g, ' ').trim();

export const inquirySubject = (inquiry: Inquiry) =>
  oneLine(`New inquiry: ${inquiry.name}${inquiry.company ? ` (${inquiry.company})` : ''}`);

export const inquiryText = (inquiry: Inquiry) =>
  [
    `Name: ${inquiry.name}`,
    `Email: ${inquiry.email}`,
    `Company: ${inquiry.company || '—'}`,
    '',
    inquiry.message,
    '',
    '— Sent from the contact form on the website. Reply to this email to answer the visitor.',
  ].join('\n');

type ResendOptions = {
  apiKey: string;
  /** Where Inquiries land. */
  to: string;
  /** A sender on the domain verified in Resend. */
  from: string;
  /** Injectable so the adapter itself is testable without the network. */
  fetchImpl?: typeof fetch;
};

/** Production adapter. */
export const resendInquiryInbox = ({
  apiKey,
  to,
  from,
  fetchImpl = fetch,
}: ResendOptions): InquiryInbox => ({
  deliver: async (inquiry) => {
    try {
      const response = await fetchImpl(RESEND_EMAILS_URL, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${apiKey}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [to],
          reply_to: inquiry.email,
          subject: inquirySubject(inquiry),
          text: inquiryText(inquiry),
        }),
        signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
      });

      if (response.ok) return { ok: true };

      // Resend answers with { statusCode, name, message } — no secrets in it.
      const detail = await response.text().catch(() => '');
      return { ok: false, error: `resend ${response.status}: ${detail.slice(0, 300)}` };
    } catch (error) {
      return { ok: false, error };
    }
  },
});

/** Test adapter. `failWith` makes the delivery-failure branch reachable without a network. */
export const inMemoryInquiryInbox = (failWith?: unknown) => {
  const delivered: Inquiry[] = [];
  const inbox: InquiryInbox = {
    deliver: async (inquiry) => {
      if (failWith !== undefined) return { ok: false, error: failWith };
      delivered.push(inquiry);
      return { ok: true };
    },
  };
  return Object.assign(inbox, { delivered });
};
