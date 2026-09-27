import { describe, expect, it, vi } from 'vitest';

import { createProjector, loadOrder, nearestAvailable } from '@/src/experience/projector';

/**
 * The frame window used to be eleven module-level mutables inside a file that
 * threw on import, so none of this could be reached. It is a factory now, with
 * the two browser APIs it depends on — image loading and off-thread decoding —
 * injectable, so the whole thing runs in jsdom with no network and no canvas.
 */

/** jsdom has no 2D context, so the projector gets one that records what it drew. */
const fakeCanvas = () => {
  const drawn: unknown[] = [];
  const ctx = {
    fillStyle: '' as unknown,
    setTransform: vi.fn(),
    fillRect: vi.fn(),
    drawImage: vi.fn((src: unknown) => drawn.push(src)),
    createRadialGradient: () => ({ addColorStop: vi.fn() }),
  };
  const canvas = {
    getContext: () => ctx,
    clientWidth: 1000,
    clientHeight: 500,
    width: 0,
    height: 0,
  } as unknown as HTMLCanvasElement;
  return { canvas, ctx, drawn };
};

/** An image that "loads" on the next microtask, and counts how many are in flight. */
const fakeImages = () => {
  let inFlight = 0;
  let peak = 0;
  const createImage = () => {
    const img = {
      decoding: '',
      complete: false,
      naturalWidth: 0,
      width: 100,
      height: 50,
      onload: null as null | (() => void),
      onerror: null as null | (() => void),
    };
    Object.defineProperty(img, 'src', {
      set() {
        inFlight++;
        peak = Math.max(peak, inFlight);
        queueMicrotask(() => {
          inFlight--;
          img.complete = true;
          img.naturalWidth = 100;
          img.onload?.();
        });
      },
    });
    return img as unknown as HTMLImageElement;
  };
  return { createImage, get peak() { return peak; } };
};

const fakeBitmap = () => ({ width: 100, height: 50, close: vi.fn() }) as unknown as ImageBitmap;

const build = (count = 20, concurrency = 5) => {
  const { canvas, ctx, drawn } = fakeCanvas();
  const images = fakeImages();
  const decode = vi.fn(async () => fakeBitmap());
  const projector = createProjector({
    canvas,
    count,
    concurrency,
    framePath: (i) => `/film/f${i}.jpg`,
    createImage: images.createImage,
    decode,
  });
  return { projector, ctx, drawn, images, decode, count };
};

describe('nearestAvailable', () => {
  it('prefers the exact frame', () => {
    expect(nearestAvailable(5, 10, (i) => i === 5)).toBe(5);
  });

  it('scans outward and takes the closer side', () => {
    expect(nearestAvailable(5, 20, (i) => i === 3 || i === 9)).toBe(3);
    expect(nearestAvailable(5, 20, (i) => i === 1 || i === 6)).toBe(6);
  });

  it('prefers the earlier frame when both sides are equally close', () => {
    expect(nearestAvailable(5, 20, (i) => i === 4 || i === 6)).toBe(4);
  });

  it('stays inside the range', () => {
    expect(nearestAvailable(0, 5, (i) => i === 4)).toBe(4);
    expect(nearestAvailable(4, 5, (i) => i === 0)).toBe(0);
  });

  it('returns null when nothing has loaded', () => {
    expect(nearestAvailable(5, 20, () => false)).toBeNull();
  });
});

describe('loading every frame', () => {
  it('loads the whole reel', async () => {
    const { projector, count } = build();
    const progress: number[] = [];

    await projector.load((loaded) => progress.push(loaded));

    expect(progress).toHaveLength(count);
    expect(progress[progress.length - 1]).toBe(count);
  });

  it('reports progress against the total', async () => {
    const { projector, count } = build();
    const totals = new Set<number>();

    await projector.load((_loaded, total) => totals.add(total));

    expect([...totals]).toEqual([count]);
  });

  it('never exceeds the concurrency cap', async () => {
    const { projector, images } = build(20, 5);

    await projector.load();

    expect(images.peak).toBeLessThanOrEqual(5);
    expect(images.peak).toBeGreaterThan(1);
  });

  it('does not open more workers than there are frames', async () => {
    const { projector, images } = build(3, 10);

    await projector.load();

    expect(images.peak).toBeLessThanOrEqual(3);
  });
});

describe('showing a frame', () => {
  it('paints the nearest loaded frame when the exact one is missing', async () => {
    const { projector, drawn } = build();
    projector.resize();

    await projector.loadOne(10);
    projector.show(5, 0);

    // Only frame 10 exists, so the scan should have found it rather than blanking.
    expect(drawn).toHaveLength(1);
    expect((drawn[0] as HTMLImageElement).naturalWidth).toBe(100);
  });

  it('letterboxes rather than drawing when no frame has loaded', () => {
    const { projector, ctx } = build();
    projector.resize();

    projector.show(5, 0);

    expect(ctx.drawImage).not.toHaveBeenCalled();
    expect(ctx.fillRect).toHaveBeenCalled();
  });

  it('decodes a window around the playhead once frames exist', async () => {
    const { projector, decode } = build();
    projector.resize();

    await projector.load();
    projector.show(10, 0.5);
    await Promise.resolve();

    expect(decode).toHaveBeenCalled();
  });

  it('repaint is a no-op before anything has been shown', () => {
    const { projector, ctx } = build();
    projector.resize();

    projector.repaint();

    expect(ctx.drawImage).not.toHaveBeenCalled();
  });
});

describe('loadOrder — sparse first, then finer', () => {
  it('fetches every frame exactly once', () => {
    const { order } = loadOrder(161);

    expect(order).toHaveLength(161);
    expect(new Set(order).size).toBe(161);
  });

  it('opens with the first and last frames, then every 16th', () => {
    const { order, firstPass } = loadOrder(161);
    const first = order.slice(0, firstPass);

    expect(first.slice(0, 2)).toEqual([0, 160]);
    expect(first).toContain(16);
    expect(first).toContain(144);
    // About a tenth of the reel is enough to start.
    expect(firstPass).toBeLessThan(161 / 8);
  });

  it('copes with a reel shorter than the first stride', () => {
    expect(loadOrder(3)).toEqual({ order: [0, 2, 1], firstPass: 2 });
  });
});

describe('starting before the whole reel is in', () => {
  it('signals the first pass before the load finishes', async () => {
    const { projector, count } = build(40, 4);
    let loadedAtFirstPass = -1;
    let loaded = 0;

    await projector.load(
      (n) => { loaded = n; },
      () => { loadedAtFirstPass = loaded; },
    );

    expect(loadedAtFirstPass).toBeGreaterThan(0);
    expect(loadedAtFirstPass).toBeLessThan(count);
  });

  it('swaps in a closer frame when it arrives, without waiting for a scroll', async () => {
    const { projector, drawn } = build(40, 1);
    projector.resize();

    await projector.loadOne(0);
    projector.show(10, 0); // only frame 0 exists — it stands in
    expect(drawn).toHaveLength(1);

    await projector.loadOne(9); // closer to 10 than 0 is
    expect(drawn).toHaveLength(2);

    await projector.loadOne(30); // further away — no repaint
    expect(drawn).toHaveLength(2);
  });
});
