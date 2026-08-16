import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { POST } from '@/api/contact';
import { serverMessages } from '@/content/messages';

/**
 * These exercise the branches of the contact endpoint that never touch the
 * network — misconfiguration, a malformed body, and the honeypot short-circuit.
 * They run without a live Supabase or Cloudflare.
 *
 * The branches past the honeypot still reach out to Turnstile and Supabase from
 * inside the handler, so they stay untestable until that path gets a seam.
 */

const post = (body: unknown) =>
  POST(
    new Request('https://example.test/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
  );

const configure = () => {
  vi.stubEnv('TURNSTILE_SECRET_KEY', 'test-secret');
  vi.stubEnv('SUPABASE_URL', 'https://project.supabase.co');
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-role-key');
};

beforeEach(() => {
  vi.stubEnv('TURNSTILE_SECRET_KEY', '');
  vi.stubEnv('SUPABASE_URL', '');
  vi.stubEnv('VITE_SUPABASE_URL', '');
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('POST /api/contact', () => {
  it('reports the configured message when the environment is missing', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await post({ name: 'A', email: 'a@b.co', message: 'hi' });
    const body = (await response.json()) as { error?: string };

    expect(response.status).toBe(500);
    expect(body.error).toBe(serverMessages.notConfigured);
  });

  it('rejects a malformed body with the malformed message', async () => {
    configure();

    const response = await post('{not json');
    const body = (await response.json()) as { error?: string };

    expect(response.status).toBe(400);
    expect(body.error).toBe(serverMessages.malformed);
  });

  it('silently accepts a filled honeypot without reaching the network', async () => {
    configure();
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    const response = await post({
      name: 'Spam Bot',
      email: 'bot@example.com',
      message: 'buy things',
      website: 'http://spam.example',
    });
    const body = (await response.json()) as { ok?: boolean };

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('never returns a message that is not in content/messages.ts', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    configure();

    const known = new Set<string>(Object.values(serverMessages));
    const response = await post('{not json');
    const body = (await response.json()) as { error?: string };

    expect(known.has(body.error ?? '')).toBe(true);
  });
});
