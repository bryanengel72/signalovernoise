import { StrictMode } from 'react';
import { act } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * Motion reads prefers-reduced-motion once and caches it process-wide, so the
 * preference is controlled here instead. `render` stays preference-blind — the
 * server cannot know it — and only the browser side sees `reduce`.
 */
const motionPreference = vi.hoisted(() => ({ reduce: false as boolean | null }));
vi.mock('motion/react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('motion/react')>()),
  useReducedMotion: () => motionPreference.reduce,
}));

import App from '@/src/App';
import { render } from '@/src/entry-server';
import { heroCopy } from '@/content/sections/hero';
import { servicesCopy } from '@/content/sections/services';
import { processCopy } from '@/content/sections/process';
import { contactCopy } from '@/content/sections/contact';

/**
 * The page ships pre-rendered, so two things must hold: the server render
 * carries the content, and the browser can hydrate it without a mismatch —
 * a mismatch makes React discard the server markup and rebuild the page.
 */

afterEach(() => {
  motionPreference.reduce = false;
  document.body.innerHTML = '';
});

describe('the server render', () => {
  const html = render();

  it('carries every Section a crawler should see', () => {
    for (const id of ['services', 'efficiency', 'process', 'about', 'contact']) {
      expect(html).toContain(`id="${id}"`);
    }
  });

  it('carries the words, not just the markup', () => {
    // Compare against the text a reader gets, with entities like &amp; decoded.
    const probe = document.createElement('div');
    probe.innerHTML = html;
    const text = probe.textContent ?? '';

    for (const line of heroCopy.headline) expect(text).toContain(line.text);
    for (const service of servicesCopy.services) expect(text).toContain(service.title);
    for (const phase of processCopy.phases) expect(text).toContain(phase.title);
    expect(text).toContain(contactCopy.bookingCta);
  });
});

const hydrate = async (reduce: boolean) => {
  motionPreference.reduce = null; // what a server render sees
  const container = document.createElement('div');
  container.innerHTML = render();
  document.body.appendChild(container);

  motionPreference.reduce = reduce; // what the visitor's browser sees
  const errors: unknown[] = [];
  await act(async () => {
    hydrateRoot(
      container,
      <StrictMode>
        <App />
      </StrictMode>,
      { onRecoverableError: (error) => errors.push(error) },
    );
  });
  return errors;
};

describe('hydrating the server render', () => {
  it('matches exactly for a default visitor', async () => {
    expect(await hydrate(false)).toEqual([]);
  });

  it('matches exactly for a visitor who prefers reduced motion', async () => {
    expect(await hydrate(true)).toEqual([]);
  });
});
