import { smooth } from './math';

/**
 * The projector: everything involved in getting frame *n* onto the canvas.
 *
 * This was eleven module-level mutable bindings in one scope — canvas metrics,
 * the image array, the bitmap window, the decode set, the playhead — which any
 * of the film's fifteen stretches of code could reach into. They are internals
 * behind one obligation now: "show frame n".
 *
 * The genuinely hard part lives here and is unchanged: drawImage on an
 * HTMLImageElement forces a synchronous JPEG decode on the main thread, so
 * frames around the playhead are decoded to ImageBitmaps off-thread and every
 * scroll draw is a pure blit. The window has an explicit lifetime — bitmaps
 * outside it are closed, not just dropped.
 */

/** Frames ahead of and behind the playhead to decode, and to keep once decoded. */
const AHEAD = 18;
const KEEP = 28;
const LETTERBOX = '#05070c';

export type ProjectorOptions = {
  canvas: HTMLCanvasElement;
  count: number;
  framePath: (index: number) => string;
  /** Injected so the decode window can be exercised without createImageBitmap. */
  decode?: (image: HTMLImageElement) => Promise<ImageBitmap>;
  /** Injected so the load pump can be exercised without real network fetches. */
  createImage?: () => HTMLImageElement;
  concurrency?: number;
};

/**
 * The nearest index at or around `idx` for which `available` is true.
 *
 * The scan runs outward in both directions so a scroll never lands on a blank
 * canvas: if the exact frame is not ready, the closest one that is gets shown.
 * Pure, and exported so it can be tested without a canvas.
 */
export const nearestAvailable = (
  idx: number,
  count: number,
  available: (i: number) => boolean,
): number | null => {
  if (available(idx)) return idx;
  for (let d = 1; d < count; d++) {
    if (idx - d >= 0 && available(idx - d)) return idx - d;
    if (idx + d < count && available(idx + d)) return idx + d;
  }
  return null;
};

/**
 * The order to fetch frames in: a sparse pass first, then ever-finer passes
 * that fill the gaps. The first pass always carries the opening and closing
 * frames, so the film can start — and resolve — as soon as it lands.
 *
 * Returns the indices once each, and the size of that first pass.
 */
export const loadOrder = (count: number, strides: ReadonlyArray<number> = [16, 8, 4, 2, 1]) => {
  const seen = new Set<number>();
  const order: number[] = [];
  const take = (i: number) => {
    if (i < 0 || i >= count || seen.has(i)) return;
    seen.add(i);
    order.push(i);
  };

  take(0);
  take(count - 1);
  for (let i = 0; i < count; i += strides[0]) take(i);
  const firstPass = order.length;

  for (const stride of strides.slice(1)) {
    for (let i = 0; i < count; i += stride) take(i);
  }
  for (let i = 0; i < count; i++) take(i); // whatever the strides missed

  return { order, firstPass };
};

export type Projector = ReturnType<typeof createProjector>;

export const createProjector = ({
  canvas,
  count,
  framePath,
  decode = (image) => createImageBitmap(image),
  createImage = () => new Image(),
  concurrency = 10,
}: ProjectorOptions) => {
  const ctx = canvas.getContext('2d', { alpha: false }) as CanvasRenderingContext2D;

  const images: HTMLImageElement[] = new Array(count);
  const bitmaps = new Map<number, ImageBitmap>();
  const decoding = new Set<number>();

  let width = 0, height = 0, cx = 0, cy = 0;
  let windowCenter = -Infinity;
  /** The frame the film asked for most recently. */
  let displayed = -1;
  /** The frame actually on the canvas — the nearest available one to `displayed`. */
  let onCanvas = -1;
  let scrimAt = 0;

  const resize = () => {
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = width / 2;
    cy = height / 2;
  };

  const decoded = (i: number) => bitmaps.has(i);
  const painted = (i: number) => {
    const image = images[i];
    return Boolean(image && image.complete && image.naturalWidth);
  };

  /** Decode a window of frames around `center`, and close the ones that fell out of it. */
  const warm = (center: number) => {
    if (Math.abs(center - windowCenter) < 3) return;
    windowCenter = center;

    const lo = Math.max(0, center - AHEAD);
    const hi = Math.min(count - 1, center + AHEAD);
    for (let i = lo; i <= hi; i++) {
      if (decoded(i) || decoding.has(i) || !painted(i)) continue;
      decoding.add(i);
      decode(images[i])
        .then((bitmap) => {
          decoding.delete(i);
          if (Math.abs(i - windowCenter) > KEEP) {
            bitmap.close();
            return;
          }
          bitmaps.set(i, bitmap);
          if (i === displayed) paint(i); // repaint if the shown frame just upgraded
        })
        .catch(() => decoding.delete(i));
    }

    for (const held of [...bitmaps.keys()]) {
      if (held < center - KEEP || held > center + KEEP) {
        bitmaps.get(held)!.close();
        bitmaps.delete(held);
      }
    }
  };

  const drawVignette = () => {
    const g = ctx.createRadialGradient(
      cx, cy, Math.min(width, height) * 0.28,
      cx, cy, Math.max(width, height) * 0.78,
    );
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.40)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
  };

  /**
   * Legibility scrim behind the resolving wordmark and tagline. Ramps in only as
   * the text appears (p 0.50 → 0.72) so the early chapters stay clean.
   */
  const drawScrim = (p: number) => {
    const alpha = smooth(0.5, 0.72, p) * 0.55;
    if (alpha <= 0.01) return;
    const top = cy * 0.9;
    const g = ctx.createRadialGradient(cx, top, 0, cx, top, Math.max(width, height) * 0.62);
    g.addColorStop(0, `rgba(4,8,14,${alpha})`);
    g.addColorStop(0.55, `rgba(4,8,14,${alpha * 0.68})`);
    g.addColorStop(1, 'rgba(4,8,14,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
  };

  /** object-cover blit of the best available source for `idx`, plus the overlays. */
  const paint = (idx: number) => {
    const best = nearestAvailable(idx, count, (i) => decoded(i) || painted(i));
    const src = best === null ? null : (bitmaps.get(best) ?? images[best]);
    ctx.fillStyle = LETTERBOX;
    ctx.fillRect(0, 0, width, height);

    if (src) {
      displayed = idx;
      onCanvas = best!;
      const iw = (src as HTMLImageElement).width;
      const ih = (src as HTMLImageElement).height;
      const scale = Math.max(width / iw, height / ih);
      ctx.drawImage(src, (width - iw * scale) / 2, (height - ih * scale) / 2, iw * scale, ih * scale);
    }

    drawVignette();
    drawScrim(scrimAt);
  };

  /**
   * Frames arrive while the film is already running. When one lands closer to
   * the frame on screen than the stand-in currently painted, swap it in — the
   * film no longer repaints while idle, so nothing else would.
   */
  const arrived = (index: number) => {
    if (displayed < 0 || !painted(index)) return;
    if (Math.abs(index - displayed) >= Math.abs(onCanvas - displayed)) return;
    windowCenter = -Infinity; // re-warm around the playhead with the new frame
    warm(displayed);
    paint(displayed);
  };

  const fetchFrame = (index: number) =>
    new Promise<void>((resolve) => {
      const image = createImage();
      image.decoding = 'async';
      image.onload = image.onerror = () => {
        arrived(index);
        resolve();
      };
      images[index] = image;
      image.src = framePath(index);
    });

  return {
    resize,
    warm,

    /** Show frame `idx`, with the scrim ramped for film progress `p`. */
    show: (idx: number, p: number) => {
      scrimAt = p;
      warm(idx);
      paint(idx);
    },

    /** Repaint whatever is currently shown — after a resize, for instance. */
    repaint: () => {
      if (displayed >= 0) paint(displayed);
    },

    /**
     * Fetch every frame, sparse pass first (see `loadOrder`). `onFirstPass`
     * fires once that pass has landed — about a tenth of the ~8MB reel — which
     * is when the film can start: `nearestAvailable` bridges the gaps, and they
     * fill in behind the playhead as the finer passes arrive. The promise
     * resolves when the whole reel is in.
     */
    load: async (
      onProgress?: (loaded: number, total: number, firstPass: number) => void,
      onFirstPass?: () => void,
    ) => {
      const { order, firstPass } = loadOrder(count);
      const firstPassPending = new Set(order.slice(0, firstPass));
      let next = 0;
      let loaded = 0;

      const pump = async (): Promise<void> => {
        while (next < order.length) {
          const index = order[next++];
          await fetchFrame(index);
          loaded++;
          onProgress?.(loaded, count, firstPass);
          if (firstPassPending.delete(index) && firstPassPending.size === 0) onFirstPass?.();
        }
      };

      await Promise.all(
        Array.from({ length: Math.min(concurrency, count) }, () => pump()),
      );
    },

    /** The reduced-motion path needs only the final frame. */
    loadOne: async (index: number) => {
      await fetchFrame(index);
    },

    get displayed() {
      return displayed;
    },
  };
};
