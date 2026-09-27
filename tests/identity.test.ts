import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

import { identity } from '@/content/identity';

const ROOT = join(__dirname, '..');
const SOURCE_DIRS = ['src', 'api'];
const EXTENSIONS = ['.ts', '.tsx'];

const walk = (dir: string): string[] => {
  const entries = readdirSync(dir);
  return entries.flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return walk(full);
    return EXTENSIONS.some((ext) => full.endsWith(ext)) ? [full] : [];
  });
};

const sourceFiles = SOURCE_DIRS.flatMap((dir) => walk(join(ROOT, dir)));

/**
 * The address used to appear at ten sites across six modules, and one of them
 * read "byan@". Identity is the only place it is allowed to be spelled out.
 *
 * Both HTML entries are in scope now — they take %EMAIL% and
 * %BOOKING_NAMESPACE% at build time, so the exemption index.html used to need
 * is gone.
 */
describe('Identity is the only source of the contact address', () => {
  it('finds source files to check', () => {
    expect(sourceFiles.length).toBeGreaterThan(10);
  });

  it('no module under src/ or api/ spells out the email address', () => {
    const offenders = sourceFiles.filter((file) =>
      readFileSync(file, 'utf8').includes(identity.email),
    );

    expect(offenders.map((f) => relative(ROOT, f))).toEqual([]);
  });

  it('no module under src/ or api/ hardcodes the booking slug', () => {
    const offenders = sourceFiles.filter((file) =>
      readFileSync(file, 'utf8').includes(identity.booking.slug),
    );

    expect(offenders.map((f) => relative(ROOT, f))).toEqual([]);
  });

  it.each(['index.html', 'experience.html', 'privacy.html'])('%s spells out neither the address nor the booking slug', (page) => {
    const html = readFileSync(join(ROOT, page), 'utf8');
    expect(html).not.toContain(identity.email);
    expect(html).not.toContain(identity.booking.slug);
  });

  it('neither page inlines the Cal snippet — the lazy loader reads the namespace from Identity', () => {
    for (const page of ['index.html', 'experience.html']) {
      const html = readFileSync(join(ROOT, page), 'utf8');
      expect(html).not.toContain('embed.js');
      expect(html).not.toContain(`"${identity.booking.namespace}"`);
    }
  });

  it('the address is well-formed', () => {
    expect(identity.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/);
    expect(identity.email.endsWith(`@${identity.domain}`)).toBe(true);
  });

  it('sends contact-form notifications from the verified notify. subdomain', () => {
    expect(identity.inquirySender.endsWith(`@notify.${identity.domain}>`)).toBe(true);
  });
});
