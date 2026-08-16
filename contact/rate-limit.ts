/**
 * Best-effort per-instance throttle. Fluid Compute reuses instances, so this
 * blunts bursts from a single IP; the Turnstile check is the real gate.
 *
 * It used to be a module-level `Map`, which meant tests leaked into each other
 * and there was no way to reset between cases. `createRateLimiter` hands each
 * caller — and each test — its own.
 */

export type RateLimiter = (ip: string) => boolean;

export type RateLimitOptions = {
  windowMs?: number;
  max?: number;
  /** Injectable so tests can advance time without waiting. */
  now?: () => number;
};

const DEFAULT_WINDOW_MS = 10 * 60 * 1000;
const DEFAULT_MAX = 5;
const MAX_TRACKED_IPS = 5000;

export const createRateLimiter = ({
  windowMs = DEFAULT_WINDOW_MS,
  max = DEFAULT_MAX,
  now = Date.now,
}: RateLimitOptions = {}): RateLimiter => {
  const recentByIp = new Map<string, number[]>();

  return (ip) => {
    const at = now();
    const recent = (recentByIp.get(ip) ?? []).filter((seen) => at - seen < windowMs);
    recent.push(at);

    if (recentByIp.size > MAX_TRACKED_IPS) recentByIp.clear();
    recentByIp.set(ip, recent);

    return recent.length > max;
  };
};
