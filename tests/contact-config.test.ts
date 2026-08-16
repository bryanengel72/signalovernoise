import { describe, expect, it } from 'vitest';

import { describeMissing, readContactConfig } from '@/contact/config';

const complete = {
  TURNSTILE_SECRET_KEY: 'secret',
  SUPABASE_URL: 'https://project.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'service-role',
};

describe('readContactConfig', () => {
  it('reads the server-side names', () => {
    const config = readContactConfig(complete);

    expect(config).not.toBeNull();
    expect(config?.supabaseUrl).toBe('https://project.supabase.co');
    expect(config?.turnstileSecret).toBe('secret');
    expect(config?.serviceRoleKey).toBe('service-role');
  });

  /**
   * There used to be a fallback to VITE_SUPABASE_URL — the only name set in the
   * Vercel project, so removing it would have taken the contact form down.
   * SUPABASE_URL is set now and the fallback is gone; `VITE_` means "compiled
   * into the public browser bundle", and reading one server-side inverts the
   * convention that makes the client/server split legible. These keep it gone.
   */
  it('ignores VITE_SUPABASE_URL entirely', () => {
    const config = readContactConfig({
      ...complete,
      SUPABASE_URL: undefined,
      VITE_SUPABASE_URL: 'https://legacy.supabase.co',
    });

    expect(config).toBeNull();
  });

  it('does not read VITE_SUPABASE_URL even when SUPABASE_URL is present', () => {
    const config = readContactConfig({
      ...complete,
      VITE_SUPABASE_URL: 'https://legacy.supabase.co',
    });

    expect(config?.supabaseUrl).toBe('https://project.supabase.co');
  });

  it('treats an empty string as absent', () => {
    expect(readContactConfig({ ...complete, SUPABASE_URL: '' })).toBeNull();
  });

  it.each([
    ['the Turnstile secret', 'TURNSTILE_SECRET_KEY'],
    ['the Supabase URL', 'SUPABASE_URL'],
    ['the service-role key', 'SUPABASE_SERVICE_ROLE_KEY'],
  ])('returns null without %s', (_label, key) => {
    expect(readContactConfig({ ...complete, [key]: undefined })).toBeNull();
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

  it('does not count VITE_SUPABASE_URL as a Supabase URL', () => {
    const described = describeMissing({
      ...complete,
      SUPABASE_URL: undefined,
      VITE_SUPABASE_URL: 'https://legacy.supabase.co',
    });

    expect(described.hasSupabaseUrl).toBe(false);
  });
});
