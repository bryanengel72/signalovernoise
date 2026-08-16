import Lenis from 'lenis';
import { experienceCopy } from '@/content/sections/experience';
import { clamp, smooth } from './math';
import { createProjector } from './projector';
import { initReveals } from './reveals';
import { formatSnr, snrAt } from './telemetry';

/**
 * THE LOCK — the scroll-film's choreography.
 *
 * The page is deliberately not React: a 161-frame canvas scrub earns its own
 * runtime. What is left in this module is the choreography — what the overlays
 * do as film progress moves from 0 to 1 — plus the boot sequence. Getting a
 * frame onto the canvas belongs to the projector; revealing the content below
 * belongs to reveals.
 *
 * Nothing here runs on import. `start()` is called by main.ts, which is what
 * experience.html loads — so this module can be imported, and its pieces
 * exercised, without a canvas in the document.
 */

declare global {
  interface Window {
    __ready?: boolean;
  }
}

const FRAME_COUNT = 161;
const framePath = (i: number) => `/film/f${String(i + 1).padStart(4, '0')}.jpg`;

const byId = (id: string) => document.getElementById(id) as HTMLElement;

/** Replace a word with one span per character, so they can resolve individually. */
const splitWord = (lineEl: Element, text: string, cls: string) => {
  lineEl.textContent = ''; // drop the crawler-visible plain-text fallback
  const frag = document.createDocumentFragment();
  for (const c of text) {
    const s = document.createElement('span');
    s.className = 'ch ' + cls;
    s.textContent = c;
    frag.appendChild(s);
  }
  lineEl.appendChild(frag);
};

export const start = () => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const jump = new URLSearchParams(location.search).get('jump');

  const canvas = document.getElementById('film-canvas') as HTMLCanvasElement;
  const filmEl = byId('film');
  const scenes = experienceCopy.chapters;

  const el = {
    chapter: byId('chapter-label'),
    snr: byId('snr'),
    prog: byId('progbar'),
    beatOpen: byId('beat-open'),
    tagline: byId('tagline'),
    cta: byId('film-cta'),
    seam: byId('seam'),
    telemetry: byId('telemetry'),
    hint: byId('hint'),
  };

  splitWord(document.querySelector('#wordmark [data-word="sig"]') as Element, 'SIGNAL', 'sig');
  splitWord(document.querySelector('#wordmark [data-word="noise"]') as Element, 'NOISE', 'noise-w');
  const allChars = [
    ...document.querySelectorAll('#wordmark .sig'),
    ...document.querySelectorAll('#wordmark .noise-w'),
  ] as HTMLElement[];
  const overEl = document.querySelector('#wordmark .over') as HTMLElement;

  const projector = createProjector({ canvas, count: FRAME_COUNT, framePath });
  const film = { target: 0, current: 0 };

  /* ---------- beat / overlay updates ---------- */
  const updateOverlays = (p: number) => {
    // opening eyebrow: visible at 0, gone by ~0.18 (during NOISE)
    el.beatOpen.style.opacity = String(1 - smooth(0.08, 0.2, p));
    el.beatOpen.style.transform = `translateY(calc(-50% - ${p * 30}px))`;

    // wordmark chars resolve as the beam locks, p 0.60 -> 0.75
    for (let i = 0; i < allChars.length; i++) {
      const local = clamp((p - (0.6 + i * 0.006)) / 0.13, 0, 1);
      const ease = local * local * (3 - 2 * local);
      const ch = allChars[i];
      ch.style.opacity = String(ease);
      ch.style.transform = `translateY(${(1 - ease) * 46}px)`;
      ch.style.filter = `blur(${(1 - ease) * 9}px)`;
    }
    const overA = clamp((p - 0.64) / 0.1, 0, 1);
    overEl.style.opacity = String(overA);
    overEl.style.transform = `translateY(${(1 - overA) * 20}px)`;

    // tagline + CTA follow during the SIGNAL pullback
    const tagA = clamp((p - 0.8) / 0.08, 0, 1);
    el.tagline.style.opacity = String(tagA);
    el.tagline.style.transform = `translateY(${(1 - tagA) * 22}px)`;
    const ctaA = clamp((p - 0.85) / 0.07, 0, 1);
    el.cta.style.opacity = String(ctaA);
    el.cta.style.transform = `translateY(${(1 - ctaA) * 22}px)`;
    el.cta.style.pointerEvents = ctaA > 0.9 ? 'auto' : 'none';

    // seam fade over the last stretch
    el.seam.style.opacity = String(smooth(0.9, 1.0, p));

    // telemetry: SNR climbs from the noise floor to a locked signal
    el.snr.textContent = formatSnr(snrAt(p));
    el.prog.style.width = (p * 100).toFixed(1) + '%';
    let sc = scenes[scenes.length - 1];
    for (const s of scenes) {
      if (p < s.until) { sc = s; break; }
    }
    el.chapter.textContent = `${sc.n} / ${sc.name}`;

    // fade telemetry + hint as we hand off to content
    const chromeFade = 1 - smooth(0.93, 1.0, p);
    el.telemetry.style.opacity = String(chromeFade);
    el.hint.style.opacity = String((1 - smooth(0.04, 0.12, p)) * chromeFade);
  };

  const render = (p: number) => {
    projector.show(Math.round(p * (FRAME_COUNT - 1)), p);
    updateOverlays(p);
  };

  /* ---------- progress from scroll ---------- */
  const computeProgress = () => {
    const r = filmEl.getBoundingClientRect();
    return clamp(-r.top / ((r.height - window.innerHeight) || 1), 0, 1);
  };

  /* ---------- main loop ---------- */
  const frame = () => {
    film.target = computeProgress();
    // lerp for butter; snap when extremely close
    film.current += (film.target - film.current) * 0.14;
    if (Math.abs(film.target - film.current) < 0.0004) film.current = film.target;

    // only paint when the stage is on screen
    const r = filmEl.getBoundingClientRect();
    if (r.bottom > 0 && r.top < window.innerHeight) render(film.current);

    requestAnimationFrame(frame);
  };

  const finishReady = () => {
    document.getElementById('loader')?.classList.add('gone');
    window.__ready = true;
  };

  /**
   * Reduced-motion path: collapse the film to one screen and show the resolved
   * end state — which is the same thing the choreography produces at p = 1, so
   * it is rendered rather than re-typed.
   */
  const renderStatic = async () => {
    filmEl.style.height = '100vh';
    projector.resize();
    await projector.loadOne(FRAME_COUNT - 1);
    render(1); // updateOverlays(1) already resolves the wordmark and hides the chrome
    finishReady();
  };

  let booted = false;
  const boot = async () => {
    if (booted) return;
    booted = true;

    projector.resize();
    initReveals();
    window.addEventListener('resize', () => { projector.resize(); projector.repaint(); }, { passive: true });

    if (reduced) {
      await renderStatic();
      return;
    }

    const label = document.getElementById('loader-label');
    await projector.load((loaded, total) => {
      if (label) {
        label.textContent = `${experienceCopy.loaderLabel} · ${Math.round((loaded / total) * 100)}%`;
      }
    });

    if (jump === null) {
      // Lenis smooth scroll — skipped when jumping, so a jump renders deterministically
      const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
      const raf = (t: number) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    } else {
      history.scrollRestoration = 'manual';
    }

    projector.warm(0); // pre-warm bitmaps around the opening frame
    requestAnimationFrame(frame);

    if (jump !== null) {
      window.scrollTo(0, +jump || 0);
      film.current = film.target = computeProgress();
      render(film.current);
    }

    finishReady();
  };

  // wait for fonts so the wordmark measures correctly, then boot
  if (document.fonts?.ready) {
    document.fonts.ready.then(boot).catch(boot);
    setTimeout(() => void boot(), 2500); // hard fallback if fonts never settle
  } else {
    void boot();
  }
};
