import Lenis from 'lenis';
import { experienceCopy } from '@/content/sections/experience';

/**
 * THE LOCK — the scroll-film engine.
 *
 * This is the part of /experience that earns its keep as its own runtime: a
 * 161-frame canvas scrub with an ImageBitmap sliding window, so every scroll
 * draw is a pure blit rather than a synchronous JPEG decode on the main thread.
 * It is deliberately not React.
 *
 * It used to be an inline <script> in a page served raw from public/, with Lenis
 * pulled from unpkg at runtime. It is now a module in the build: Lenis is
 * bundled and version-pinned, and the chapter names come from Copy.
 */

declare global {
  interface Window {
    __ready?: boolean;
  }
}

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const JUMP = new URLSearchParams(location.search).get('jump');

/* ---------- utils ---------- */
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const invlerp = (a: number, b: number, v: number) => clamp((v - a) / (b - a), 0, 1);
const smooth = (a: number, b: number, v: number) => {
  const t = invlerp(a, b, v);
  return t * t * (3 - 2 * t);
};

/* ---------- canvas setup ---------- */
const canvas = document.getElementById('film-canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d', { alpha: false }) as CanvasRenderingContext2D;
let W = 0, H = 0, DPR = 1, CX = 0, CY = 0;
function resize() {
  DPR = Math.min(1.5, window.devicePixelRatio || 1);
  W = canvas.clientWidth; H = canvas.clientHeight;
  canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  CX = W / 2; CY = H / 2;
}

/* ---------- footage frames (real Seedance film, scrubbed) ---------- */
const FRAME_COUNT = 161;
const framePath = (i: number) => `/film/f${String(i + 1).padStart(4, '0')}.jpg`;
const images: HTMLImageElement[] = new Array(FRAME_COUNT);
let loadedCount = 0;

/* ---------- film state ---------- */
const film = { target: 0, current: 0 };

// scenes for the chapter readout — names come from Copy
const scenes = experienceCopy.chapters.map((chapter, i) => ({
  n: chapter.n,
  name: chapter.name,
  to: [0.24, 0.42, 0.6, 0.8, 1.01][i] ?? 1.01,
}));

const byId = (id: string) => document.getElementById(id) as HTMLElement;

const el = {
  chapter: byId('chapter-label'),
  snr: byId('snr'),
  prog: byId('progbar'),
  beatOpen: byId('beat-open'),
  beatResolve: byId('beat-resolve'),
  tagline: byId('tagline'),
  cta: byId('film-cta'),
  seam: byId('seam'),
  telemetry: byId('telemetry'),
  hint: byId('hint'),
  chrome: byId('chrome'),
};

/* ---------- build char-split wordmark ---------- */
function splitWord(lineEl: Element, text: string, cls: string) {
  lineEl.textContent = ''; // drop the crawler-visible plain-text fallback
  const frag = document.createDocumentFragment();
  for (const c of text) {
    const s = document.createElement('span');
    s.className = 'ch ' + cls;
    s.textContent = c;
    frag.appendChild(s);
  }
  lineEl.appendChild(frag);
}
splitWord(document.querySelector('#wordmark [data-word="sig"]') as Element, 'SIGNAL', 'sig');
splitWord(document.querySelector('#wordmark [data-word="noise"]') as Element, 'NOISE', 'noise-w');
const sigChars = [...document.querySelectorAll('#wordmark .sig')] as HTMLElement[];
const noiseChars = [...document.querySelectorAll('#wordmark .noise-w')] as HTMLElement[];
const allChars = sigChars.concat(noiseChars);
const overEl = document.querySelector('#wordmark .over') as HTMLElement;

/* ---------- frame-scrubbing engine (ImageBitmap sliding window) ----------
   drawImage(HTMLImage) forces a synchronous JPEG decode on the main thread;
   decode off-thread around the playhead so every scroll draw is a pure blit. */
const bitmaps = new Map<number, ImageBitmap>();
const decoding = new Set<number>();
const B_AHEAD = 18, B_KEEP = 28;
let bmpCenter = -999, displayed = -1;

function ensureBitmaps(center: number) {
  if (Math.abs(center - bmpCenter) < 3) return;
  bmpCenter = center;
  const lo = Math.max(0, center - B_AHEAD), hi = Math.min(FRAME_COUNT - 1, center + B_AHEAD);
  for (let i = lo; i <= hi; i++) {
    if (bitmaps.has(i) || decoding.has(i) || !images[i] || !images[i].complete || !images[i].naturalWidth) continue;
    decoding.add(i);
    createImageBitmap(images[i]).then((b) => {
      decoding.delete(i);
      if (Math.abs(i - bmpCenter) > B_KEEP) { b.close(); return; }
      bitmaps.set(i, b);
      if (i === displayed) blit(i); // repaint if the shown frame just upgraded
    }).catch(() => decoding.delete(i));
  }
  for (const k of Array.from(bitmaps.keys()))
    if (k < center - B_KEEP || k > center + B_KEEP) { bitmaps.get(k)!.close(); bitmaps.delete(k); }
}

// prefer the exact bitmap, else exact image, else scan outward for any loaded frame
function pickSource(idx: number): CanvasImageSource | null {
  if (bitmaps.has(idx)) return bitmaps.get(idx)!;
  if (images[idx] && images[idx].complete && images[idx].naturalWidth) return images[idx];
  for (let d = 1; d < FRAME_COUNT; d++) {
    if (bitmaps.has(idx - d)) return bitmaps.get(idx - d)!;
    if (bitmaps.has(idx + d)) return bitmaps.get(idx + d)!;
    const a = images[idx - d], b = images[idx + d];
    if (a && a.complete && a.naturalWidth) return a;
    if (b && b.complete && b.naturalWidth) return b;
  }
  return null;
}

function drawVignette() {
  const g = ctx.createRadialGradient(CX, CY, Math.min(W, H) * 0.28, CX, CY, Math.max(W, H) * 0.78);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.40)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

// legibility scrim: darkens the footage behind the resolving wordmark/tagline,
// ramping in only as the text appears (p 0.50 -> 0.72) so early chapters stay clean
let curP = 0;
function drawScrim(p: number) {
  const a = smooth(0.50, 0.72, p) * 0.55;
  if (a <= 0.01) return;
  const cy = CY * 0.9;
  const g = ctx.createRadialGradient(CX, cy, 0, CX, cy, Math.max(W, H) * 0.62);
  g.addColorStop(0, `rgba(4,8,14,${a})`);
  g.addColorStop(0.55, `rgba(4,8,14,${a * 0.68})`);
  g.addColorStop(1, 'rgba(4,8,14,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

// object-cover blit of frame idx
function blit(idx: number) {
  const src = pickSource(idx);
  ctx.fillStyle = '#05070c'; ctx.fillRect(0, 0, W, H);
  if (src) {
    displayed = idx;
    const iw = (src as HTMLImageElement).width, ih = (src as HTMLImageElement).height;
    const scale = Math.max(W / iw, H / ih);
    const dw = iw * scale, dh = ih * scale;
    ctx.drawImage(src, (W - dw) / 2, (H - dh) / 2, dw, dh);
  }
  drawVignette();
  drawScrim(curP);
}

function render(p: number) {
  curP = p;
  const idx = Math.round(p * (FRAME_COUNT - 1));
  ensureBitmaps(idx);
  blit(idx);
}

/* ---------- beat / overlay updates ---------- */
function updateOverlays(p: number) {
  // opening eyebrow: visible at 0, gone by ~0.18 (during NOISE)
  const openA = 1 - smooth(0.08, 0.20, p);
  el.beatOpen.style.opacity = String(openA);
  el.beatOpen.style.transform = `translateY(calc(-50% - ${p * 30}px))`;

  // wordmark chars resolve as the beam locks, p 0.60 -> 0.75
  for (let i = 0; i < allChars.length; i++) {
    const stagger = i * 0.006;
    const local = clamp((p - (0.60 + stagger)) / 0.13, 0, 1);
    const ease = local * local * (3 - 2 * local);
    const ch = allChars[i];
    ch.style.opacity = String(ease);
    ch.style.transform = `translateY(${(1 - ease) * 46}px)`;
    ch.style.filter = `blur(${(1 - ease) * 9}px)`;
  }
  const overA = clamp((p - 0.64) / 0.10, 0, 1);
  overEl.style.opacity = String(overA);
  overEl.style.transform = `translateY(${(1 - overA) * 20}px)`;

  // tagline + CTA follow during the SIGNAL pullback
  const tagA = clamp((p - 0.80) / 0.08, 0, 1);
  el.tagline.style.opacity = String(tagA);
  el.tagline.style.transform = `translateY(${(1 - tagA) * 22}px)`;
  const ctaA = clamp((p - 0.85) / 0.07, 0, 1);
  el.cta.style.opacity = String(ctaA);
  el.cta.style.transform = `translateY(${(1 - ctaA) * 22}px)`;
  el.cta.style.pointerEvents = ctaA > 0.9 ? 'auto' : 'none';

  // seam fade over the last stretch
  el.seam.style.opacity = String(smooth(0.90, 1.0, p));

  // telemetry: SNR climbs from the noise floor to a locked signal
  const snr = lerp(-18, 24, smooth(0.12, 0.90, p));
  el.snr.textContent = (snr >= 0 ? '+' : '−') + Math.abs(snr).toFixed(1) + ' dB';
  el.prog.style.width = (p * 100).toFixed(1) + '%';
  let sc = scenes[scenes.length - 1];
  for (const s of scenes) { if (p < s.to) { sc = s; break; } }
  el.chapter.textContent = `${sc.n} / ${sc.name}`;

  // fade telemetry + hint as we hand off to content
  const chromeFade = 1 - smooth(0.93, 1.0, p);
  el.telemetry.style.opacity = String(chromeFade);
  el.hint.style.opacity = String((1 - smooth(0.04, 0.12, p)) * chromeFade);
}

/* ---------- progress from scroll ---------- */
const filmEl = byId('film');
function computeProgress() {
  const r = filmEl.getBoundingClientRect();
  const denom = (r.height - window.innerHeight) || 1;
  return clamp(-r.top / denom, 0, 1);
}

/* ---------- main loop ---------- */
function frame() {
  film.target = computeProgress();
  // lerp for butter; snap when extremely close
  film.current += (film.target - film.current) * 0.14;
  if (Math.abs(film.target - film.current) < 0.0004) film.current = film.target;

  // only paint when the stage is on screen
  const r = filmEl.getBoundingClientRect();
  const onScreen = r.bottom > 0 && r.top < window.innerHeight;
  if (onScreen) {
    render(film.current);
    updateOverlays(film.current);
  }
  requestAnimationFrame(frame);
}

/* ---------- reduced-motion static path ---------- */
function renderStatic() {
  // collapse the film to one screen, show the resolved final frame
  filmEl.style.height = '100vh';
  resize();
  curP = 1;
  blit(FRAME_COUNT - 1);
  // resolve overlays fully
  allChars.forEach((c) => { c.style.opacity = '1'; c.style.transform = 'none'; c.style.filter = 'none'; });
  overEl.style.opacity = '1'; overEl.style.transform = 'none';
  el.tagline.style.opacity = '1'; el.tagline.style.transform = 'none';
  el.cta.style.opacity = '1'; el.cta.style.transform = 'none'; el.cta.style.pointerEvents = 'auto';
  el.beatOpen.style.opacity = '0';
  el.seam.style.opacity = '1';
  el.snr.textContent = '+24.0 dB'; el.prog.style.width = '100%'; el.chapter.textContent = '05 / Signal';
  el.hint.style.opacity = '0';
}

/* ---------- content reveals ---------- */
function initReveals() {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach((n, i) => {
    (n as HTMLElement).style.transitionDelay = (Math.min(i % 4, 3) * 0.06) + 's';
    io.observe(n);
  });
}

/* ---------- frame loading (concurrency-capped pump + progress readout) ----------
   Every frame must be buffered before scrubbing starts. The payload is tiny
   (~8MB/161 frames) so this is fast — and it's the only way to guarantee
   pickSource()'s nearest-loaded fallback never has to reach for a frame from
   a completely different part of the story mid-scroll. */
function loadFrames(onReady: () => void) {
  const label = document.getElementById('loader-label');
  const READY_AT = FRAME_COUNT;
  const MAX = 10;
  let next = 0, inFlight = 0, fired = false;
  function fire() { if (!fired) { fired = true; onReady(); } }
  function pump() {
    while (inFlight < MAX && next < FRAME_COUNT) {
      const i = next++; const img = new Image(); img.decoding = 'async';
      img.onload = img.onerror = () => {
        inFlight--; loadedCount++;
        if (label) label.textContent = `${experienceCopy.loaderLabel} · ${Math.round(loadedCount / FRAME_COUNT * 100)}%`;
        if (loadedCount >= READY_AT) fire();
        pump();
      };
      images[i] = img; img.src = framePath(i); inFlight++;
    }
  }
  pump();
}

/* ---------- boot ---------- */
let booted = false;
function boot() {
  if (booted) return; booted = true;
  resize();
  initReveals();
  window.addEventListener('resize', () => { resize(); if (displayed >= 0) blit(displayed); }, { passive: true });

  if (REDUCED) {
    // static path needs only the final frame
    const img = new Image();
    img.onload = img.onerror = () => { images[FRAME_COUNT - 1] = img; renderStatic(); finishReady(); };
    img.src = framePath(FRAME_COUNT - 1);
    return;
  }

  loadFrames(() => {
    // Lenis smooth scroll (skip if jumping for deterministic verification)
    if (JUMP === null) {
      const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
      const raf = (t: number) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    } else {
      history.scrollRestoration = 'manual';
    }
    ensureBitmaps(0); // pre-warm bitmaps around the opening frame
    requestAnimationFrame(frame);
    if (JUMP !== null) {
      // settle to the requested scroll position and paint one deterministic frame
      window.scrollTo(0, +JUMP || 0);
      film.current = film.target = computeProgress();
      render(film.current);
      updateOverlays(film.current);
    }
    finishReady();
  });
}

function finishReady() {
  const loader = document.getElementById('loader');
  if (loader) loader.classList.add('gone');
  window.__ready = true;
}

// wait for fonts so the wordmark measures correctly, then boot
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(boot).catch(boot);
  // hard fallback
  setTimeout(() => { if (!booted) boot(); }, 2500);
} else {
  boot();
}
