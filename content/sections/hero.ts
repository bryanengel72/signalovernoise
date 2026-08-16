import { identity } from '../identity.js';

/**
 * Hero Copy. `headline` is ordered — each line is revealed in sequence — and
 * `emphasis` marks the line that carries the signal colour. The animation
 * timing that used to be fused to these strings stays in the Section.
 */
export type HeroCopy = {
  eyebrow: string;
  headline: ReadonlyArray<{ text: string; emphasis: boolean }>;
  subhead: string;
  trustChips: ReadonlyArray<string>;
  primaryCta: string;
  secondaryCta: string;
  bookingSlug: string;
  scrollCue: string;
  /** The cinematic backdrop. The alt text lives beside the image it describes. */
  backdrop: {
    poster: string;
    posterAlt: string;
    sources: ReadonlyArray<{ src: string; type: string }>;
  };
};

export const heroCopy: HeroCopy = {
  eyebrow: 'B2B AI Consulting',
  headline: [
    { text: 'Simple AI.', emphasis: false },
    { text: 'Clear Strategy.', emphasis: false },
    { text: 'Real Growth.', emphasis: true },
  ],
  subhead:
    'We build custom AI systems that cut costs, accelerate decisions, and deliver measurable ROI — without the hype, lock-in, or guesswork.',
  trustChips: ['No Lock-In', '90-Day ROI Focus', 'Professional-Grade'],
  primaryCta: 'Get Your Free AI Audit',
  secondaryCta: 'Book Consultation',
  bookingSlug: identity.booking.slug,
  scrollCue: 'Scroll',
  backdrop: {
    poster: '/hero-lock-poster.jpg',
    posterAlt: 'Radio telescope dish locked onto a signal under the Milky Way at night',
    sources: [
      { src: '/hero-lock.webm', type: 'video/webm' },
      { src: '/hero-lock.mp4', type: 'video/mp4' },
    ],
  },
};
