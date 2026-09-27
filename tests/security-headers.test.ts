import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

type Rule = { source: string; headers: Array<{ key: string; value: string }> };

const vercel = JSON.parse(readFileSync(join(__dirname, '..', 'vercel.json'), 'utf8')) as {
  headers: Rule[];
};
const everyRoute = vercel.headers.find((rule) => rule.source === '/(.*)');
const header = (name: string) =>
  everyRoute?.headers.find((h) => h.key.toLowerCase() === name.toLowerCase())?.value;
const csp = header('Content-Security-Policy') ?? header('Content-Security-Policy-Report-Only') ?? '';
const directive = (name: string) =>
  csp.split(';').map((d) => d.trim()).find((d) => d.startsWith(`${name} `)) ?? '';

describe('security headers on every route', () => {
  it.each([
    ['X-Content-Type-Options', 'nosniff'],
    ['Referrer-Policy', 'strict-origin-when-cross-origin'],
    ['X-Frame-Options', 'DENY'],
  ])('%s is %s', (name, value) => {
    expect(header(name)).toBe(value);
  });

  it('switches off browser features the site never uses', () => {
    for (const feature of ['camera=()', 'microphone=()', 'geolocation=()']) {
      expect(header('Permissions-Policy')).toContain(feature);
    }
  });
});

describe('the Content-Security-Policy', () => {
  it('exists', () => {
    expect(csp).not.toBe('');
  });

  it('allows no inline script, and scripts only from this site and the two embeds', () => {
    expect(directive('script-src')).toBe(
      "script-src 'self' https://app.cal.com https://challenges.cloudflare.com",
    );
  });

  it('lets the booking modal and the human check load their frames', () => {
    expect(directive('frame-src')).toContain('https://app.cal.com');
    expect(directive('frame-src')).toContain('https://challenges.cloudflare.com');
  });

  it('refuses plugins, base-tag hijacks and being framed by other sites', () => {
    expect(directive('object-src')).toBe("object-src 'none'");
    expect(directive('base-uri')).toBe("base-uri 'self'");
    expect(directive('frame-ancestors')).toBe("frame-ancestors 'none'");
  });

  it('serves fonts from this site only — they are self-hosted', () => {
    expect(directive('font-src')).not.toContain('googleapis');
    expect(directive('font-src')).not.toContain('gstatic');
  });
});
