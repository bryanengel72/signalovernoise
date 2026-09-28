import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { installRevealOnScroll } from '@/src/revealOnScroll';

/**
 * The scroll entrances, with the viewport and element positions controlled:
 * nothing hides before a real scroll, only below-the-fold elements hide then,
 * and each reveals when it intersects.
 */

let observed: Element[] = [];
let callback: IntersectionObserverCallback;

class FakeObserver {
  constructor(cb: IntersectionObserverCallback) {
    callback = cb;
  }
  observe(el: Element) {
    observed.push(el);
  }
  unobserve(el: Element) {
    observed = observed.filter((o) => o !== el);
  }
  disconnect() {
    observed = [];
  }
  takeRecords() {
    return [];
  }
}

const place = (top: number) => {
  const el = document.createElement('div');
  el.dataset.reveal = 'rise';
  el.getBoundingClientRect = () => ({ top, bottom: top + 100 }) as DOMRect;
  document.body.appendChild(el);
  return el;
};

const realObserver = globalThis.IntersectionObserver;
let uninstall = () => {};

beforeEach(() => {
  observed = [];
  globalThis.IntersectionObserver = FakeObserver as unknown as typeof IntersectionObserver;
  vi.stubGlobal('innerHeight', 800);
});

afterEach(() => {
  uninstall();
  globalThis.IntersectionObserver = realObserver;
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

describe('installRevealOnScroll', () => {
  it('hides nothing until the visitor scrolls — a renderer that never scrolls sees it all', () => {
    const below = place(2000);
    uninstall = installRevealOnScroll();

    expect(below.hasAttribute('data-reveal-state')).toBe(false);
    expect(observed).toEqual([]);
  });

  it('on the first scroll, tucks away only what is still below the fold', () => {
    const onScreen = place(300);
    const below = place(1500);
    uninstall = installRevealOnScroll();

    window.dispatchEvent(new Event('scroll'));

    expect(onScreen.hasAttribute('data-reveal-state')).toBe(false);
    expect(below.getAttribute('data-reveal-state')).toBe('pending');
    expect(observed).toEqual([below]);
  });

  it('reveals an element when it scrolls into view', () => {
    const below = place(1500);
    uninstall = installRevealOnScroll();
    window.dispatchEvent(new Event('scroll'));

    callback([{ isIntersecting: true, target: below } as unknown as IntersectionObserverEntry], {} as IntersectionObserver);

    expect(below.getAttribute('data-reveal-state')).toBe('in');
    expect(observed).toEqual([]);
  });

  it('arms once, not on every scroll', () => {
    place(1500);
    uninstall = installRevealOnScroll();
    window.dispatchEvent(new Event('scroll'));
    const afterFirst = observed.length;
    place(1600);
    window.dispatchEvent(new Event('scroll'));

    expect(observed.length).toBe(afterFirst);
  });

  it('does nothing for visitors who prefer reduced motion', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({ matches: q.includes('reduce') }) as MediaQueryList);
    const below = place(1500);
    uninstall = installRevealOnScroll();
    window.dispatchEvent(new Event('scroll'));

    expect(below.hasAttribute('data-reveal-state')).toBe(false);
  });
});
