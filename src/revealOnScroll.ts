/**
 * Scroll entrances for everything marked `data-reveal` (see Reveal.tsx).
 *
 * The page arrives fully visible, and stays that way until the visitor
 * actually scrolls. On the first scroll, elements still below the fold are
 * tucked away — they are off screen, so nobody sees it happen — and each one
 * animates in as it arrives. Anything already on screen is left alone.
 *
 * Waiting for a real scroll is the point. Google's renderer never scrolls: it
 * loads at a normal size, stretches the viewport to the page's full height,
 * and does not reliably let animations run. Motion's entrances, driven the
 * same way from load, left every Section at opacity 0 in its snapshot. Here,
 * a renderer that does not scroll never hides anything.
 *
 * State lives in a `data-reveal-state` attribute rather than a class, so a
 * React re-render that rewrites `className` cannot reset it.
 */

const STATE = 'data-reveal-state';
/** Start revealing a little before the element's edge crosses into view. */
const ROOT_MARGIN = '0px 0px -10% 0px';

export const installRevealOnScroll = (root: ParentNode = document, win: Window = window) => {
  if (win.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return () => {};

  let observer: IntersectionObserver | null = null;

  const arm = () => {
    const pending = [...root.querySelectorAll<HTMLElement>('[data-reveal]')].filter(
      (el) => !el.hasAttribute(STATE) && el.getBoundingClientRect().top > win.innerHeight,
    );
    if (pending.length === 0) return;

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          observer!.unobserve(el);
          el.setAttribute(STATE, 'in');
          settle(el);
        }
      },
      { rootMargin: ROOT_MARGIN },
    );

    for (const el of pending) {
      el.setAttribute(STATE, 'pending');
      observer.observe(el);
    }
  };

  const settle = (el: HTMLElement) => {
    // Drop the attribute once the entrance has run, so the element's own
    // transitions (hover colours and the like) apply again.
    const done = () => el.removeAttribute(STATE);
    el.addEventListener('transitionend', done, { once: true });
    const { transitionDelay, transitionDuration } = win.getComputedStyle(el);
    const ms = (parseFloat(transitionDelay) + parseFloat(transitionDuration)) * 1000;
    win.setTimeout(done, (Number.isFinite(ms) ? ms : 0) + 150);
  };

  win.addEventListener('scroll', arm, { once: true, passive: true });

  return () => {
    win.removeEventListener('scroll', arm);
    observer?.disconnect();
  };
};
