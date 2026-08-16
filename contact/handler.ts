import { inquiryProblemMessages, serverMessages } from '../content/messages.js';
import { FIELD_LIMITS, cleanField, cleanInquiry, validateInquiry } from './inquiry.js';
import type { HumanCheck } from './human-check.js';
import type { InquiryStore } from './inquiry-store.js';
import type { RateLimiter } from './rate-limit.js';

/**
 * The contact endpoint's decision logic, with every dependency in front of it.
 *
 * It used to reach for `fetch`, `createClient` and `process.env` from inside the
 * request handler, so nothing about it could run without a live Supabase and
 * Cloudflare. Now the seam is the interface, and the interface is the test
 * surface: `api/contact.ts` wires the production adapters, tests wire in-memory
 * ones, and every branch below is reachable offline.
 */

export type ContactServices = {
  humanCheck: HumanCheck;
  store: InquiryStore;
};

export type ContactDeps = {
  /** Returns null when the environment is not configured. */
  services: () => ContactServices | null;
  isRateLimited: RateLimiter;
};

const reply = (body: Record<string, unknown>, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

const clientIp = (request: Request) =>
  request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
  request.headers.get('x-real-ip') ||
  '';

export const createContactHandler =
  ({ services, isRateLimited }: ContactDeps) =>
  async (request: Request): Promise<Response> => {
    const resolved = services();
    if (!resolved) {
      return reply({ error: serverMessages.notConfigured }, 500);
    }

    let payload: Record<string, unknown>;
    try {
      payload = (await request.json()) as Record<string, unknown>;
    } catch {
      return reply({ error: serverMessages.malformed }, 400);
    }

    // Honeypot: a hidden field only automation fills in. Report success and drop it.
    if (cleanField(payload.website, FIELD_LIMITS.website)) {
      return reply({ ok: true }, 200);
    }

    const ip = clientIp(request);
    if (ip && isRateLimited(ip)) {
      return reply({ error: serverMessages.rateLimited }, 429);
    }

    const token = cleanField(payload.turnstileToken, FIELD_LIMITS.turnstileToken);
    if (!token) {
      return reply({ error: serverMessages.missingHumanCheck }, 400);
    }

    const verdict = await resolved.humanCheck(token, ip);
    if (!verdict.ok) {
      console.warn('contact: turnstile rejected submission', { ip, codes: verdict.codes });
      return reply({ error: serverMessages.humanCheckFailed }, 403);
    }

    const inquiry = cleanInquiry(payload);
    const problem = validateInquiry(inquiry);
    if (problem) {
      return reply({ error: inquiryProblemMessages[problem] }, 400);
    }

    const result = await resolved.store.save(inquiry);
    if (!result.ok) {
      console.error('contact: supabase insert failed', result.error);
      return reply({ error: serverMessages.saveFailed }, 500);
    }

    return reply({ ok: true }, 200);
  };
