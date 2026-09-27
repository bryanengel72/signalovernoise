import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import App from '@/src/App';
import { Marquee } from '@/src/components/ui/Marquee';
import { Navbar } from '@/src/components/sections/Navbar';

afterEach(cleanup);

const ROOT = join(__dirname, '..');
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return walk(full);
    return full.endsWith('.tsx') ? [full] : [];
  });
const components = walk(join(ROOT, 'src'));

describe('text size', () => {
  const css = read('src/index.css');

  it('scales desktop from the visitor’s own font size, not a fixed pixel value', () => {
    expect(css).toMatch(/font-size:\s*85%/);
    expect(css).not.toMatch(/html\s*\{[^}]*font-size:\s*[\d.]+px/);
  });

  it('floors the small steps on desktop, where the 85% scale shrank them', () => {
    expect(css).toMatch(/--text-xs:\s*0\.875rem/);
    expect(css).toMatch(/--text-sm:\s*1rem/);
  });

  it('no component sets text below Tailwind’s smallest step', () => {
    const offenders = components.filter((f) => /text-\[(?:[0-9]|1[01])px\]/.test(readFileSync(f, 'utf8')));
    expect(offenders.map((f) => relative(ROOT, f))).toEqual([]);
  });

  it('the scroll-film has no text under 12px either', () => {
    expect(read('experience.html')).not.toMatch(/font-size:\s*(?:[0-9]|1[01])(?:\.\d+)?px/);
  });
});

describe('contrast (WCAG AA, 4.5:1 for small text)', () => {
  it('white text over the dark hero is at least 50% opaque', () => {
    // Decorative glyphs hidden from assistive tech are exempt.
    const faint = components.filter((f) =>
      readFileSync(f, 'utf8')
        .split('\n')
        .some((line) => /\btext-white\/[1-4]0\b/.test(line) && !line.includes('aria-hidden')),
    );
    expect(faint.map((f) => relative(ROOT, f))).toEqual([]);
  });

  it('muted text and placeholders are at least 75% opaque', () => {
    const faint = components.filter((f) => /text-muted\/(?:[1-6]\d|70)\b/.test(readFileSync(f, 'utf8')));
    expect(faint.map((f) => relative(ROOT, f))).toEqual([]);
  });

  it('the scroll-film’s dim colour passes on its background', () => {
    expect(read('experience.html')).toContain('--color-muted-dim:#7a8499;');
  });
});

describe('keyboard and screen readers', () => {
  it('the first focusable element skips to the main content', () => {
    const { container } = render(<App />);
    const first = container.querySelector('a, button');

    expect(first?.textContent).toBe('Skip to content');
    expect(first?.getAttribute('href')).toBe('#main');
    expect(container.querySelector('main#main')).not.toBeNull();
  });

  it('the logo links home and has a name', () => {
    render(<Navbar />);
    const logo = screen.getByRole('link', { name: /home/i });
    expect(logo.getAttribute('href')).toBe('/');
  });

  it('the marquee is read once, not once per copy', () => {
    const { container } = render(<Marquee />);
    const copies = container.querySelectorAll('.marquee-track > div');

    expect(copies.length).toBeGreaterThan(1);
    expect(copies[0].getAttribute('aria-hidden')).toBeNull();
    for (const copy of [...copies].slice(1)) expect(copy.getAttribute('aria-hidden')).toBe('true');
  });

  it('the scroll-film canvas is decoration, hidden from assistive tech', () => {
    expect(read('experience.html')).toContain('<canvas id="film-canvas" aria-hidden="true">');
  });
});
