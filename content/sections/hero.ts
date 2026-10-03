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
  /** Opens the Cal.com booking modal. */
  primaryCta: string;
  /** Jumps to the priced offers in the Services Section. */
  secondaryCta: string;
  /** The Cal.com embed — slug, namespace and config, the same trio the Contact button uses. */
  booking: { slug: string; namespace: string; config: string };
  scrollCue: string;
  /** The cinematic backdrop. The alt text lives beside the image it describes. */
  backdrop: {
    poster: string;
    posterAlt: string;
    sources: ReadonlyArray<{ src: string; type: string }>;
  };
};

export const heroCopy: HeroCopy = {
  eyebrow: 'AI for Professional Services Firms',
  headline: [
    { text: 'Less Admin.', emphasis: false },
    { text: 'More Clients.', emphasis: false },
    { text: 'Same Team.', emphasis: true },
  ],
  subhead:
    'We find the hours your team loses to intake, document prep, reporting, and email, then build AI that does that work inside the tools you already use. Fixed prices. Results measured against where you started.',
  trustChips: ['Fixed Prices', 'No Lock-In', '90-Day ROI Focus'],
  primaryCta: 'Book a Free 30-Minute Call',
  secondaryCta: 'See Pricing',
  booking: identity.booking,
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
