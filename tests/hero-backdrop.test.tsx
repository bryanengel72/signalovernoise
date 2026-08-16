import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { useRef } from 'react';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { HeroBackdrop } from '@/src/components/ui/HeroBackdrop';
import { heroCopy } from '@/content/sections/hero';

const ROOT = join(__dirname, '..');

/**
 * The backdrop parallaxes against the Section that contains it, and motion
 * rejects a target ref that was never attached to a mounted element. So the
 * harness mounts it the way HeroSection does.
 */
const Harness = ({ backdrop = heroCopy.backdrop }) => {
  const ref = useRef<HTMLElement>(null);
  return (
    <section ref={ref}>
      <HeroBackdrop targetRef={ref} backdrop={backdrop} />
    </section>
  );
};

/** Point `prefers-reduced-motion` at a given answer for the next render. */
const setReducedMotion = (reduce: boolean) => {
  vi.stubGlobal(
    'matchMedia',
    (query: string) =>
      ({
        matches: query.includes('prefers-reduced-motion') ? reduce : false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList,
  );
};

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('HeroBackdrop', () => {
  it('plays the video when motion is welcome', () => {
    setReducedMotion(false);
    const { container } = render(<Harness />);

    const video = container.querySelector('video');
    expect(video).not.toBeNull();
    expect(container.querySelector('img')).toBeNull();

    const sources = [...container.querySelectorAll('source')].map((s) => s.getAttribute('src'));
    expect(sources).toEqual(heroCopy.backdrop.sources.map((s) => s.src));
    expect(video?.getAttribute('poster')).toBe(heroCopy.backdrop.poster);
  });

  it('renders every source Copy declares, with its type', () => {
    setReducedMotion(false);
    const { container } = render(<Harness />);

    const types = [...container.querySelectorAll('source')].map((s) => s.getAttribute('type'));
    expect(types).toEqual(heroCopy.backdrop.sources.map((s) => s.type));
  });

  it('takes the poster and its alt text from the same place', () => {
    // The alt text used to live in Copy while the image it described lived in
    // the component. They travel together now.
    expect(heroCopy.backdrop.posterAlt).toContain('telescope');
    expect(heroCopy.backdrop.poster).toMatch(/\.(jpg|jpeg|webp|png)$/);
  });
});

/**
 * The two branches were a 30-line copy-paste with a character-identical
 * className. This is what stops them being pasted back.
 */
describe('the backdrop markup lives in one module', () => {
  const heroSection = readFileSync(
    join(ROOT, 'src/components/sections/HeroSection.tsx'),
    'utf8',
  );

  it('HeroSection no longer positions the backdrop layer itself', () => {
    expect(heroSection).not.toContain('object-cover object-center');
    expect(heroSection).not.toContain('motion.video');
  });

  it('HeroSection does not hardcode the media paths', () => {
    expect(heroSection).not.toContain('hero-lock');
  });
});
