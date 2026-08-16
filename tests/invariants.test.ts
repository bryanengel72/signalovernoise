import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { experienceCopy } from '@/content/sections/experience';
import { renderHtml } from '@/content/html-tokens';
import { formatSnr, snrAt } from '@/src/experience/telemetry';

const ROOT = join(__dirname, '..');
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');

const indexCss = read('src/index.css');
const app = read('src/App.tsx');
const navbar = read('src/components/sections/Navbar.tsx');
const marquee = read('src/components/ui/Marquee.tsx');
const experienceHtml = read('experience.html');

/**
 * Each of these was a value in one file that had to agree with a value — or a
 * formula — in another, with nothing enforcing it. One of them was wrong.
 */

describe('the telemetry seed comes from the formula that animates it', () => {
  it('the markup no longer hardcodes a dB reading', () => {
    expect(experienceHtml).toContain('%SNR_SEED%');
    expect(experienceHtml).not.toMatch(/id="snr">[^%]/);
  });

  it('the rendered seed equals the engine value at p = 0', () => {
    const rendered = renderHtml(experienceHtml, 'experience.html');
    expect(rendered).toContain(formatSnr(snrAt(0)));
  });

  it('and that value is the noise floor, not the −8.0 dB it used to claim', () => {
    expect(formatSnr(snrAt(0))).toBe('−18.0 dB');
    expect(renderHtml(experienceHtml, 'experience.html')).not.toContain('−8.0 dB');
  });
});

describe('the navbar height is declared once', () => {
  it('lives in the theme as a spacing token', () => {
    expect(indexCss).toMatch(/--spacing-nav:\s*[\d.]+rem;/);
    expect(indexCss.match(/--spacing-nav:/g)).toHaveLength(1);
  });

  it('sets the navbar and the content offset from that one token', () => {
    expect(navbar).toContain('h-nav');
    expect(app).toContain('pt-nav');
  });

  it('no longer carries a hand-computed offset', () => {
    expect(app).not.toContain('4.5625rem');
  });
});

describe('reduced motion reaches the marquee through a class', () => {
  it('the track is animated by a class, not an inline style', () => {
    expect(marquee).toContain('marquee-track');
    expect(marquee).not.toContain("animation: 'marquee-scroll");
  });

  it('the reduced-motion rule targets that class, not an attribute substring', () => {
    expect(indexCss).not.toContain('[style*="marquee-scroll"]');
    expect(indexCss).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*\.marquee-track/);
  });
});

describe('chapter boundaries travel with chapter names', () => {
  it('every chapter carries its own boundary', () => {
    for (const chapter of experienceCopy.chapters) {
      expect(typeof chapter.until).toBe('number');
    }
  });

  it('the boundaries ascend and cover the whole film', () => {
    const bounds = experienceCopy.chapters.map((c) => c.until);
    expect([...bounds].sort((a, b) => a - b)).toEqual(bounds);
    expect(bounds[bounds.length - 1]).toBeGreaterThan(1);
  });
});

/**
 * Scrolling to a section was a JS helper prop-drilled through two modules, which
 * also forced smooth scrolling on visitors who had asked for none —
 * scrollIntoView({ behavior: 'smooth' }) ignores the reduced-motion rule the
 * stylesheet already declares.
 */
describe('scrolling to a section is declared, not scripted', () => {
  const hero = read('src/components/sections/HeroSection.tsx');

  it('no module scrolls imperatively', () => {
    for (const source of [app, navbar, hero]) {
      expect(source).not.toContain('scrollIntoView');
      expect(source).not.toContain('scrollTo');
    }
  });

  it('the navbar links to its sections', () => {
    expect(navbar).toContain('href={`#${id}`}');
    expect(navbar).toContain('href="#contact"');
  });

  it('the stylesheet owns the behaviour, and drops it under reduced motion', () => {
    expect(indexCss).toMatch(/html\s*\{[\s\S]*?scroll-behavior:\s*smooth/);
    expect(indexCss).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*scroll-behavior:\s*auto/);
  });

  it('anchor targets clear the fixed navbar, from the same token', () => {
    expect(indexCss).toMatch(/section\[id\]\s*\{[\s\S]*?scroll-margin-top:[^;]*--spacing-nav/);
  });
});

describe('the noise overlay opacity is declared once', () => {
  it('is set in CSS, not overridden by a utility that never applied', () => {
    expect(app).toContain('className="noise-bg"');
    expect(app).not.toContain('opacity-[0.03]');
    expect(indexCss.match(/\.noise-bg\s*\{[\s\S]*?opacity:\s*[\d.]+;/)).not.toBeNull();
  });
});
