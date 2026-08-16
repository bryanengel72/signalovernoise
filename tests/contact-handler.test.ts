import { afterEach, describe, expect, it, vi } from 'vitest';

import { createContactHandler } from '@/contact/handler';
import { stubHumanCheck } from '@/contact/human-check';
import { inMemoryInquiryStore } from '@/contact/inquiry-store';
import { inquiryProblemMessages, serverMessages } from '@/content/messages';
import { FIELD_LIMITS } from '@/contact/inquiry';

/**
 * The whole endpoint, exercised through its seam. No Supabase, no Cloudflare,
 * no network of any kind — the handler takes a human check and an inquiry store,
 * and these wire in the in-memory pair.
 */

type Options = {
  unconfigured?: boolean;
  humanOk?: boolean;
  saveFails?: boolean;
  rateLimited?: boolean;
};

const build = ({ unconfigured, humanOk = true, saveFails, rateLimited }: Options = {}) => {
  const store = inMemoryInquiryStore(saveFails ? new Error('insert failed') : undefined);
  const humanCheck = stubHumanCheck({ ok: humanOk, codes: humanOk ? [] : ['invalid-input-response'] });

  const handler = createContactHandler({
    services: () => (unconfigured ? null : { humanCheck, store }),
    isRateLimited: () => Boolean(rateLimited),
  });

  return { handler, store, humanCheck };
};

const valid = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  company: 'Analytical Engines',
  message: 'I would like to discuss an engagement.',
  website: '',
  turnstileToken: 'token-abc',
};

const send = (
  handler: ReturnType<typeof createContactHandler>,
  body: unknown,
  headers: Record<string, string> = {},
) =>
  handler(
    new Request('https://example.test/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...headers },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
  );

const readBody = async (response: Response) =>
  (await response.json()) as { ok?: boolean; error?: string };

afterEach(() => vi.restoreAllMocks());

describe('the happy path', () => {
  it('stores the Inquiry and reports success', async () => {
    const { handler, store } = build();

    const response = await send(handler, valid);
    const body = await readBody(response);

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(store.saved).toEqual([
      {
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        company: 'Analytical Engines',
        message: 'I would like to discuss an engagement.',
      },
    ]);
  });

  it('does not store the honeypot or the token', async () => {
    const { handler, store } = build();

    await send(handler, valid);

    expect(Object.keys(store.saved[0])).toEqual(['name', 'email', 'company', 'message']);
  });

  it('passes the token and caller address to the human check', async () => {
    const { handler, humanCheck } = build();

    await send(handler, valid, { 'x-forwarded-for': '203.0.113.7, 70.41.3.18' });

    expect(humanCheck.calls).toEqual([{ token: 'token-abc', ip: '203.0.113.7' }]);
  });

  it('falls back to x-real-ip', async () => {
    const { handler, humanCheck } = build();

    await send(handler, valid, { 'x-real-ip': '198.51.100.4' });

    expect(humanCheck.calls[0].ip).toBe('198.51.100.4');
  });

  it('trims and truncates before storing', async () => {
    const { handler, store } = build();

    await send(handler, { ...valid, name: `  ${'n'.repeat(500)}  `, message: '  hi  ' });

    expect(store.saved[0].name).toHaveLength(FIELD_LIMITS.name);
    expect(store.saved[0].message).toBe('hi');
  });
});

describe('the gates', () => {
  it('reports the configured message when the environment is missing', async () => {
    const { handler, store } = build({ unconfigured: true });

    const response = await send(handler, valid);

    expect(response.status).toBe(500);
    expect((await readBody(response)).error).toBe(serverMessages.notConfigured);
    expect(store.saved).toEqual([]);
  });

  it('rejects a malformed body', async () => {
    const { handler } = build();

    const response = await send(handler, '{not json');

    expect(response.status).toBe(400);
    expect((await readBody(response)).error).toBe(serverMessages.malformed);
  });

  it('swallows a filled honeypot without checking the human or storing', async () => {
    const { handler, store, humanCheck } = build();

    const response = await send(handler, { ...valid, website: 'http://spam.example' });

    expect(response.status).toBe(200);
    expect((await readBody(response)).ok).toBe(true);
    expect(store.saved).toEqual([]);
    expect(humanCheck.calls).toEqual([]);
  });

  it('turns away a rate-limited caller', async () => {
    const { handler, store } = build({ rateLimited: true });

    const response = await send(handler, valid, { 'x-forwarded-for': '203.0.113.7' });

    expect(response.status).toBe(429);
    expect((await readBody(response)).error).toBe(serverMessages.rateLimited);
    expect(store.saved).toEqual([]);
  });

  it('requires a Turnstile token', async () => {
    const { handler } = build();

    const response = await send(handler, { ...valid, turnstileToken: '' });

    expect(response.status).toBe(400);
    expect((await readBody(response)).error).toBe(serverMessages.missingHumanCheck);
  });

  it('refuses a submission the human check rejects', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { handler, store } = build({ humanOk: false });

    const response = await send(handler, valid);

    expect(response.status).toBe(403);
    expect((await readBody(response)).error).toBe(serverMessages.humanCheckFailed);
    expect(store.saved).toEqual([]);
  });

  it('checks the human before it validates the fields', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { handler } = build({ humanOk: false });

    const response = await send(handler, { ...valid, name: '', email: 'nope' });

    expect((await readBody(response)).error).toBe(serverMessages.humanCheckFailed);
  });
});

describe('Inquiry validation', () => {
  it.each([
    ['missing-name', { name: '' }],
    ['invalid-email', { email: 'not-an-email' }],
    ['missing-message', { message: '   ' }],
  ] as const)('answers %s with the shared message', async (problem, patch) => {
    const { handler, store } = build();

    const response = await send(handler, { ...valid, ...patch });

    expect(response.status).toBe(400);
    expect((await readBody(response)).error).toBe(inquiryProblemMessages[problem]);
    expect(store.saved).toEqual([]);
  });

  it('accepts a missing company', async () => {
    const { handler, store } = build();

    const response = await send(handler, { ...valid, company: '' });

    expect(response.status).toBe(200);
    expect(store.saved[0].company).toBe('');
  });
});

describe('when the store fails', () => {
  it('reports the save-failure message', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { handler } = build({ saveFails: true });

    const response = await send(handler, valid);

    expect(response.status).toBe(500);
    expect((await readBody(response)).error).toBe(serverMessages.saveFailed);
    expect(error).toHaveBeenCalled();
  });
});

describe('the response envelope', () => {
  it('is never cached', async () => {
    const { handler } = build();

    const response = await send(handler, valid);

    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('content-type')).toBe('application/json');
  });

  it('only ever answers with a message from content/messages.ts', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const known = new Set<string>([
      ...Object.values(serverMessages),
      ...Object.values(inquiryProblemMessages),
    ]);

    const bodies = [
      '{not json',
      { ...valid, turnstileToken: '' },
      { ...valid, name: '' },
      { ...valid, email: 'bad' },
      { ...valid, message: '' },
    ];

    for (const body of bodies) {
      const { handler } = build();
      const { error } = await readBody(await send(handler, body));
      expect(known.has(error ?? '')).toBe(true);
    }
  });
});
