import { identity } from '../identity';

/**
 * Experience Copy — the scroll-film at /experience.html.
 *
 * Deliberately its own voice, not the site's. The film says "99% faster" where
 * the site says "99% time reduction", and it runs four delta rows to the site's
 * five: shorter reads better against moving footage. That divergence is art
 * direction, so it lives here rather than being forced to match
 * content/sections/efficiency.ts.
 *
 * What it must NOT diverge on is Identity — the address and booking slug come
 * from the same place as everywhere else.
 */

export type ExperienceCopy = {
  meta: { title: string; description: string; ogTitle: string; ogDescription: string };
  nav: ReadonlyArray<{ label: string; href: string }>;
  navCta: string;
  /** `until` is the film-progress boundary this chapter runs to — paired with its name so the two cannot fall out of step. */
  chapters: ReadonlyArray<{ n: string; name: string; until: number }>;
  openingBeat: string;
  tagline: string;
  filmCtaPrimary: string;
  filmCtaSecondary: string;
  manifesto: { leadIn: string; body: string };
  capabilities: {
    leadIn: string;
    headline: { lead: string; emphasis: string };
    sub: string;
    items: ReadonlyArray<{ num: string; title: string; desc: string }>;
  };
  proof: {
    leadIn: string;
    headline: { lead: string; emphasis: string };
    columns: { process: string; before: string; after: string; gain: string };
    rows: ReadonlyArray<{ process: string; before: string; after: string; gain: string }>;
  };
  cta: {
    leadIn: string;
    headline: { lead: string; emphasis: string };
    sub: string;
    primary: string;
    secondary: string;
    fine: string;
  };
  footer: { copyright: string; links: ReadonlyArray<{ label: string; href: string }> };
  loaderLabel: string;
  scrollHint: string;
};

export const experienceCopy: ExperienceCopy = {
  meta: {
    title: `${identity.shortName} — The Lock`,
    description:
      'From noise to signal. An AI consultancy that cuts through the hype and locks onto measurable ROI.',
    ogTitle: `${identity.name} | THE LOCK`,
    ogDescription:
      'From noise to signal. We build AI systems that cut through the hype and lock onto measurable ROI — no lock-in, no guesswork, no noise.',
  },

  nav: [
    { label: 'Capabilities', href: '#capabilities' },
    { label: 'Proof', href: '#proof' },
    { label: 'Contact', href: '#contact' },
  ],
  navCta: 'Get a Free AI Audit',

  chapters: [
    { n: '01', name: 'Noise', until: 0.24 },
    { n: '02', name: 'Carrier', until: 0.42 },
    { n: '03', name: 'Sweep', until: 0.6 },
    { n: '04', name: 'Lock', until: 0.8 },
    { n: '05', name: 'Signal', until: 1.01 },
  ],

  openingBeat: 'Somewhere in the noise',
  tagline:
    'We build AI systems that cut through the hype and lock onto measurable ROI — no lock-in, no guesswork, no noise.',
  filmCtaPrimary: 'Get Your Free AI Audit',
  filmCtaSecondary: 'See What We Build',

  manifesto: {
    leadIn: 'The premise',
    body: 'Most companies are drowning in AI <em>noise</em> — tools that never stick, pilots that stall, spend nobody can measure. We do one thing: find the <em>signal</em>, and build the system that locks onto it.',
  },

  capabilities: {
    leadIn: 'Capabilities',
    headline: { lead: 'What We', emphasis: 'Build.' },
    sub: 'Every engagement is scoped to your context — healthcare IT, veterinary, legal, media, and professional services. Real working systems, not chatbots.',
    items: [
      {
        num: '01',
        title: 'Workflow Automation',
        desc: 'Map manual processes, identify ROI targets, and build the workflows that remove the busywork.',
      },
      {
        num: '02',
        title: 'Custom AI Agents',
        desc: 'Purpose-built agents for specific jobs inside your business — scoped, tested, and owned by you.',
      },
      {
        num: '03',
        title: 'Strategy &amp; Roadmap',
        desc: 'A clear, prioritized 90-day AI roadmap tied to measurable outcomes, not a wish list.',
      },
      {
        num: '04',
        title: 'Training &amp; Handoff',
        desc: "We build your team's capability to maintain and extend everything after we leave.",
      },
    ],
  },

  proof: {
    leadIn: 'Real results',
    headline: { lead: 'Before vs.', emphasis: 'After.' },
    columns: { process: 'Process', before: 'Manual', after: 'Automated', gain: 'Delta' },
    rows: [
      { process: 'Data Synthesis', before: '10 hrs / wk', after: '&lt; 5 min', gain: '99% faster' },
      { process: 'Lead Qualification', before: '3 hrs / day', after: 'Real-time', gain: 'Continuous' },
      { process: 'Report Generation', before: '4 hrs / cycle', after: 'On-demand', gain: 'Zero overhead' },
      { process: 'Email Triage', before: '90 min / day', after: 'Automated', gain: '100% coverage' },
    ],
  },

  cta: {
    leadIn: 'Get in touch',
    headline: { lead: "Let's find your", emphasis: 'signal.' },
    sub: "Tell us what you're trying to solve. We'll tell you honestly whether AI can help — and exactly what it would take.",
    primary: 'Book a Discovery Call',
    secondary: 'Enter the Full Site',
    fine: 'Discovery calls within 48h · No lock-in · 90-day ROI focus',
  },

  footer: {
    copyright: `© ${identity.copyrightYear} ${identity.name}`,
    links: [
      { label: 'Home', href: '/' },
      { label: 'Privacy', href: '/?privacy=1' },
      { label: 'Capabilities', href: '#capabilities' },
    ],
  },

  loaderLabel: 'Calibrating receiver',
  scrollHint: 'Scroll to tune in',
};
