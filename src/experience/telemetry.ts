import { lerp, smooth } from './math';

/**
 * The telemetry readout: signal-to-noise climbing from the noise floor to a
 * locked signal as the film scrubs.
 *
 * The markup used to seed this readout with a hand-typed "−8.0 dB" while the
 * engine computed −18.0 dB at p = 0 — a number in one file that had to match a
 * formula in another, and did not. The formula lives here now, and the seed in
 * experience.html is generated from it at build time.
 *
 * Framework-free and DOM-free on purpose: content/experience-html.ts imports it
 * to render the seed, and the engine imports it to animate.
 */

export const SNR_FLOOR = -18;
export const SNR_PEAK = 24;

/** Signal-to-noise in dB at film progress `p` (0 → 1). */
export const snrAt = (p: number) => lerp(SNR_FLOOR, SNR_PEAK, smooth(0.12, 0.9, p));

/** How the readout renders a dB value — note the minus is U+2212, not a hyphen. */
export const formatSnr = (snr: number) =>
  (snr >= 0 ? '+' : '−') + Math.abs(snr).toFixed(1) + ' dB';

/** What the markup should show before the first animation frame. */
export const snrSeed = () => formatSnr(snrAt(0));
