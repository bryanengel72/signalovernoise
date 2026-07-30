import { createClient } from '@supabase/supabase-js';

/**
 * Contact form endpoint.
 *
 * The browser can no longer write to Supabase directly — it POSTs here, and a
 * submission is only stored once Cloudflare Turnstile confirms server-side that
 * a human solved the challenge. The Supabase write uses the service-role key,
 * which never leaves this function.
 */

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Best-effort per-instance throttle. Fluid Compute reuses instances, so this
// blunts bursts from a single IP; the Turnstile check is the real gate.
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;
const recentByIp = new Map<string, number[]>();

const isRateLimited = (ip: string) => {
  const now = Date.now();
  const recent = (recentByIp.get(ip) ?? []).filter((at) => now - at < RATE_WINDOW_MS);
  recent.push(now);
  if (recentByIp.size > 5000) recentByIp.clear();
  recentByIp.set(ip, recent);
  return recent.length > RATE_MAX;
};

const reply = (body: Record<string, unknown>, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

const clean = (value: unknown, max: number) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

const clientIp = (request: Request) =>
  request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
  request.headers.get('x-real-ip') ||
  '';

const verifyHuman = async (token: string, secret: string, ip: string) => {
  const form = new URLSearchParams({ secret, response: token });
  if (ip) form.set('remoteip', ip);

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: form,
    });
    const result = (await response.json()) as {
      success?: boolean;
      'error-codes'?: string[];
    };
    return { ok: result.success === true, codes: result['error-codes'] ?? [] };
  } catch (error) {
    console.error('contact: turnstile verification request failed', error);
    return { ok: false, codes: ['verification-unreachable'] };
  }
};

export async function POST(request: Request) {
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!turnstileSecret || !supabaseUrl || !serviceRoleKey) {
    console.error('contact: missing environment configuration', {
      hasTurnstileSecret: Boolean(turnstileSecret),
      hasSupabaseUrl: Boolean(supabaseUrl),
      hasServiceRoleKey: Boolean(serviceRoleKey),
    });
    return reply({ error: 'The contact form is not configured. Please email us directly.' }, 500);
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return reply({ error: 'Malformed request.' }, 400);
  }

  // Honeypot: a hidden field only automation fills in. Report success and drop it.
  if (clean(payload.website, 200)) {
    return reply({ ok: true }, 200);
  }

  const ip = clientIp(request);
  if (ip && isRateLimited(ip)) {
    return reply({ error: 'Too many submissions from this connection. Try again shortly.' }, 429);
  }

  const token = clean(payload.turnstileToken, 4096);
  if (!token) {
    return reply({ error: 'Please complete the human check and try again.' }, 400);
  }

  const verdict = await verifyHuman(token, turnstileSecret, ip);
  if (!verdict.ok) {
    console.warn('contact: turnstile rejected submission', { ip, codes: verdict.codes });
    return reply({ error: 'Human check failed. Please try the check again.' }, 403);
  }

  const inquiry = {
    name: clean(payload.name, 100),
    email: clean(payload.email, 200),
    company: clean(payload.company, 120),
    message: clean(payload.message, 5000),
  };

  // Turnstile is the spam gate, so keep these checks to genuinely empty or
  // malformed input and name the field that actually failed.
  if (!inquiry.name) {
    return reply({ error: 'Please add your name.' }, 400);
  }
  if (!EMAIL_PATTERN.test(inquiry.email)) {
    return reply({ error: "That email address doesn't look right." }, 400);
  }
  if (!inquiry.message) {
    return reply({ error: "Please tell us what you're working on." }, 400);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase.from('booking_inquiries').insert([inquiry]);

  if (error) {
    console.error('contact: supabase insert failed', error);
    return reply(
      { error: 'We could not save your message. Please email bryan@signalovernoiseai.com.' },
      500,
    );
  }

  return reply({ ok: true }, 200);
}
