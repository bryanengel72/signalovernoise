import { describe, expect, it } from 'vitest';

import { describeMissing, readContactConfig } from '@/contact/config';

const complete = {
  TURNSTILE_SECRET_KEY: 'secret',
  RESEND_API_KEY: 're_key',
};

describe('readContactConfig', () => {
  it('reads the server-side names', () => {
    const config = readContactConfig(complete);

    expect(config).toEqual({ turnstileSecret: 'secret', resendApiKey: 're_key' });
  });

  it('treats an empty string as absent', () => {
    expect(readContactConfig({ ...complete, RESEND_API_KEY: '' })).toBeNull();
  });

  it.each([
    ['the Turnstile secret', 'TURNSTILE_SECRET_KEY'],
    ['the Resend API key', 'RESEND_API_KEY'],
  ])('returns null without %s', (_label, key) => {
    expect(readContactConfig({ ...complete, [key]: undefined })).toBeNull();
  });

  /** `VITE_` means "compiled into the public browser bundle" — never a server secret. */
  it('does not accept a VITE_-prefixed key', () => {
    expect(
      readContactConfig({ ...complete, RESEND_API_KEY: undefined, VITE_RESEND_API_KEY: 're_key' }),
    ).toBeNull();
  });
});

describe('describeMissing', () => {
  it('reports which pieces are present without leaking their values', () => {
    const described = describeMissing({ ...complete, RESEND_API_KEY: undefined });

    expect(described).toEqual({ hasTurnstileSecret: true, hasResendApiKey: false });
    expect(JSON.stringify(described)).not.toContain('secret');
  });
});
