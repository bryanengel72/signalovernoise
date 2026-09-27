import { describe, expect, it, vi } from 'vitest';

import { inquirySubject, inquiryText, resendInquiryInbox } from '@/contact/inquiry-inbox';
import type { Inquiry } from '@/contact/inquiry';

/**
 * The production adapter, with `fetch` injected — so what it would send to
 * Resend is asserted without the network.
 */

const inquiry: Inquiry = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  company: 'Analytical Engines',
  message: 'I would like to discuss an engagement.',
};

const options = {
  apiKey: 're_test',
  to: 'owner@example.com',
  from: 'Website <inquiries@example.com>',
};

const respond = (status: number, body: unknown = {}) =>
  vi.fn(async () => new Response(JSON.stringify(body), { status }));

describe('resendInquiryInbox', () => {
  it('posts one email to the owner, replying to the visitor', async () => {
    const fetchImpl = respond(200, { id: 'email_1' });

    const result = await resendInquiryInbox({ ...options, fetchImpl }).deliver(inquiry);

    expect(result).toEqual({ ok: true });
    expect(fetchImpl).toHaveBeenCalledTimes(1);

    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://api.resend.com/emails');
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>).authorization).toBe('Bearer re_test');
    expect(JSON.parse(init.body as string)).toEqual({
      from: options.from,
      to: [options.to],
      reply_to: 'ada@example.com',
      subject: 'New inquiry: Ada Lovelace (Analytical Engines)',
      text: inquiryText(inquiry),
    });
  });

  it('reports a rejected send with the status, for the log line', async () => {
    const fetchImpl = respond(422, { name: 'validation_error', message: 'domain not verified' });

    const result = await resendInquiryInbox({ ...options, fetchImpl }).deliver(inquiry);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(String(result.error)).toContain('resend 422');
  });

  it('reports a network failure instead of throwing', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError('fetch failed');
    });

    const result = await resendInquiryInbox({ ...options, fetchImpl }).deliver(inquiry);

    expect(result.ok).toBe(false);
  });
});

describe('the notification email', () => {
  it('keeps a visitor-supplied line break out of the subject', () => {
    expect(inquirySubject({ ...inquiry, name: 'Ada\r\nBcc: x@evil.test', company: '' })).toBe(
      'New inquiry: Ada Bcc: x@evil.test',
    );
  });

  it('omits the company from the subject when there is none', () => {
    expect(inquirySubject({ ...inquiry, company: '' })).toBe('New inquiry: Ada Lovelace');
  });

  it('carries every field and the message in the body', () => {
    const text = inquiryText(inquiry);

    for (const value of Object.values(inquiry)) expect(text).toContain(value);
  });
});
