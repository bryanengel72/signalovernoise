import { describe, expect, it } from 'vitest';

import { createRateLimiter } from '@/contact/rate-limit';

/**
 * This was module-level mutable state, so cases leaked into each other and
 * there was no way to reset between them. Each limiter is now its own.
 */
describe('createRateLimiter', () => {
  it('allows submissions up to the limit', () => {
    const isRateLimited = createRateLimiter({ max: 3 });

    expect(isRateLimited('1.1.1.1')).toBe(false);
    expect(isRateLimited('1.1.1.1')).toBe(false);
    expect(isRateLimited('1.1.1.1')).toBe(false);
    expect(isRateLimited('1.1.1.1')).toBe(true);
  });

  it('tracks each address separately', () => {
    const isRateLimited = createRateLimiter({ max: 1 });

    expect(isRateLimited('1.1.1.1')).toBe(false);
    expect(isRateLimited('2.2.2.2')).toBe(false);
    expect(isRateLimited('1.1.1.1')).toBe(true);
    expect(isRateLimited('2.2.2.2')).toBe(true);
  });

  it('forgets attempts once the window passes', () => {
    let clock = 0;
    const isRateLimited = createRateLimiter({ max: 1, windowMs: 1000, now: () => clock });

    expect(isRateLimited('1.1.1.1')).toBe(false);
    expect(isRateLimited('1.1.1.1')).toBe(true);

    clock += 1001;
    expect(isRateLimited('1.1.1.1')).toBe(false);
  });

  it('gives each limiter its own state', () => {
    const first = createRateLimiter({ max: 1 });
    const second = createRateLimiter({ max: 1 });

    expect(first('1.1.1.1')).toBe(false);
    expect(first('1.1.1.1')).toBe(true);
    expect(second('1.1.1.1')).toBe(false);
  });
});
