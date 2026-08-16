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
 * index.html is deliberately out of scope: it is static markup with no build
 * step, so it cannot import Identity. Its JSON-LD and OG tags still carry a
 * literal address.
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

  it('the address is well-formed', () => {
    expect(identity.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/);
    expect(identity.email.endsWith(`@${identity.domain}`)).toBe(true);
  });
});
