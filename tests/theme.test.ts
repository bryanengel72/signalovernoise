import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = join(__dirname, '..');
const indexCss = readFileSync(join(ROOT, 'src/index.css'), 'utf8');
const experienceHtml = readFileSync(join(ROOT, 'experience.html'), 'utf8');

const SHARED_TOKENS = [
  '--color-bg',
  '--color-surface',
  '--color-grid',
  '--color-signal',
  '--color-text',
  '--color-muted',
] as const;

/** Pull `--name: #value;` pairs out of a stylesheet, ignoring whitespace style. */
const readTokens = (source: string) => {
  const found = new Map<string, string>();
  for (const [, name, value] of source.matchAll(/(--color-[a-z-]+)\s*:\s*([^;]+);/g)) {
    if (!found.has(name)) found.set(name, value.trim().toLowerCase());
  }
  return found;
};

const appTokens = readTokens(indexCss);
const filmTokens = readTokens(experienceHtml);

describe('the theme is declared once', () => {
  it.each(SHARED_TOKENS)('%s is declared exactly once in index.css', (token) => {
    const declarations = indexCss.match(new RegExp(`${token}\\s*:`, 'g')) ?? [];
    expect(declarations).toHaveLength(1);
  });

  it('has no second :root block shadowing the @theme block', () => {
    expect(indexCss.match(/:root\s*\{/g) ?? []).toHaveLength(0);
  });
});

/**
 * The two files cannot share one declaration — experience.html is a build entry
 * now, but it has no Tailwind, so it cannot consume an @theme block. They are
 * kept in sync by hand, so this is the thing that catches a drift. The display
 * font had already drifted once: Outfit in the app against Space Grotesk here.
 */
describe('the scroll-film uses the same theme as the app', () => {
  it.each(SHARED_TOKENS)('%s has the same value in both files', (token) => {
    expect(filmTokens.get(token)).toBeDefined();
    expect(filmTokens.get(token)).toBe(appTokens.get(token));
  });

  it('both use Space Grotesk for display', () => {
    expect(indexCss).toContain('Space Grotesk');
    expect(experienceHtml).toContain('Space+Grotesk');
    expect(indexCss).not.toContain('Outfit');
  });

  it('both use Inter for body text', () => {
    expect(indexCss).toContain('"Inter"');
    expect(experienceHtml).toContain('Inter');
  });

  it('no longer names a mono token that points at a proportional face', () => {
    expect(indexCss).not.toContain('--font-mono');
  });
});

describe('brand colours are never written as literals in src/', () => {
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((entry) => {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) return walk(full);
      return /\.tsx?$/.test(full) ? [full] : [];
    });

  const sourceFiles = walk(join(ROOT, 'src'));

  it.each(SHARED_TOKENS)('%s is referenced by name, never by value', (token) => {
    const value = appTokens.get(token);
    expect(value).toBeDefined();

    const offenders = sourceFiles.filter((file) =>
      readFileSync(file, 'utf8').toLowerCase().includes(value as string),
    );

    expect(offenders.map((f) => relative(ROOT, f))).toEqual([]);
  });

  it.each([
    ['the signal cyan', /0\s*,\s*229\s*,\s*255/],
    ['the page background', /11\s*,\s*14\s*,\s*20/],
  ])('does not write %s as an rgb triplet either', (_label, pattern) => {
    const offenders = sourceFiles.filter((file) => pattern.test(readFileSync(file, 'utf8')));
    expect(offenders.map((f) => relative(ROOT, f))).toEqual([]);
  });
});
