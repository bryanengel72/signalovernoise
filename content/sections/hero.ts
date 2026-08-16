import { identity } from '../identity';

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
  posterAlt: string;
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
  posterAlt: 'Radio telescope dish locked onto a signal under the Milky Way at night',
};
