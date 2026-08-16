import { describe, expect, it } from 'vitest';

import { describeMissing, readContactConfig } from '@/contact/config';

const complete = {
  TURNSTILE_SECRET_KEY: 'secret',
  SUPABASE_URL: 'https://project.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'service-role',
};

/**
 * The VITE_SUPABASE_URL fallback is a wart — VITE_ means "compiled into the
 * public browser bundle", so reading it server-side inverts the convention. It
 * survives because SUPABASE_URL may not be set in the Vercel project, and
 * removing it there would take the contact form down (see README).
 *
 * These pin the behaviour so the eventual cleanup is a deliberate change rather
 * than an accident.
 */
describe('readContactConfig', () => {
  it('reads the server-side names', () => {
    const config = readContactConfig(complete);

    expect(config).not.toBeNull();
    expect(config?.supabaseUrl).toBe('https://project.supabase.co');
    expect(config?.turnstileSecret).toBe('secret');
    expect(config?.serviceRoleKey).toBe('service-role');
    expect(config?.usedLegacySupabaseUrl).toBe(false);
  });

  it('falls back to VITE_SUPABASE_URL and flags that it did', () => {
    const config = readContactConfig({
      ...complete,
      SUPABASE_URL: undefined,
      VITE_SUPABASE_URL: 'https://legacy.supabase.co',
    });

    expect(config?.supabaseUrl).toBe('https://legacy.supabase.co');
    expect(config?.usedLegacySupabaseUrl).toBe(true);
  });

  it('prefers SUPABASE_URL when both are present', () => {
    const config = readContactConfig({
      ...complete,
      VITE_SUPABASE_URL: 'https://legacy.supabase.co',
    });

    expect(config?.supabaseUrl).toBe('https://project.supabase.co');
    expect(config?.usedLegacySupabaseUrl).toBe(false);
  });

  it('treats an empty string as absent', () => {
    const config = readContactConfig({
      ...complete,
      SUPABASE_URL: '',
      VITE_SUPABASE_URL: 'https://legacy.supabase.co',
    });

    expect(config?.supabaseUrl).toBe('https://legacy.supabase.co');
    expect(config?.usedLegacySupabaseUrl).toBe(true);
  });

  it.each([
    ['the Turnstile secret', 'TURNSTILE_SECRET_KEY'],
    ['the service-role key', 'SUPABASE_SERVICE_ROLE_KEY'],
  ])('returns null without %s', (_label, key) => {
    expect(readContactConfig({ ...complete, [key]: undefined })).toBeNull();
  });

  it('returns null when neither Supabase URL name is set', () => {
    expect(
      readContactConfig({ ...complete, SUPABASE_URL: undefined, VITE_SUPABASE_URL: undefined }),
    ).toBeNull();
  });
});

describe('describeMissing', () => {
  it('reports which pieces are present without leaking their values', () => {
    const described = describeMissing({ ...complete, SUPABASE_SERVICE_ROLE_KEY: undefined });

    expect(described).toEqual({
      hasTurnstileSecret: true,
      hasSupabaseUrl: true,
      hasServiceRoleKey: false,
    });
    expect(JSON.stringify(described)).not.toContain('service-role');
  });
});
