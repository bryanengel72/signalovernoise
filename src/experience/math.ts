/** Interpolation helpers shared by the film engine and its telemetry readout. */

export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const invlerp = (a: number, b: number, v: number) => clamp((v - a) / (b - a), 0, 1);

/** Smoothstep between two bounds. */
export const smooth = (a: number, b: number, v: number) => {
  const t = invlerp(a, b, v);
  return t * t * (3 - 2 * t);
};
