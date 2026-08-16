/**
 * Scroll reveals for the content below the film.
 *
 * A page concern, not a film one — it shared no state with the engine and was
 * only sitting in film.ts because that file was where the page's JavaScript
 * happened to live.
 *
 * This is the film's own reveal mechanism, deliberately not the React app's:
 * that page has no Motion, so `Reveal.tsx` cannot reach it.
 */

const STAGGER_STEP = 0.06;
const STAGGER_MAX = 3;

export const initReveals = (root: ParentNode = document) => {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.15 },
  );

  root.querySelectorAll('.reveal').forEach((node, i) => {
    (node as HTMLElement).style.transitionDelay = `${Math.min(i % 4, STAGGER_MAX) * STAGGER_STEP}s`;
    observer.observe(node);
  });

  return observer;
};
