import { identity } from '../identity.js';

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
      'From noise to signal. AI automation for professional services firms: fixed prices, no lock-in, measured results.',
    ogTitle: `${identity.name} | THE LOCK`,
    ogDescription:
      'From noise to signal. We find the hours your firm loses to admin and build AI that wins them back. Fixed prices, no lock-in, no noise.',
  },

  nav: [
    { label: 'Pricing', href: '#capabilities' },
    { label: 'Proof', href: '#proof' },
    { label: 'Contact', href: '#contact' },
  ],
  navCta: 'Book a Free Call',

  chapters: [
    { n: '01', name: 'Noise', until: 0.24 },
    { n: '02', name: 'Carrier', until: 0.42 },
    { n: '03', name: 'Sweep', until: 0.6 },
    { n: '04', name: 'Lock', until: 0.8 },
    { n: '05', name: 'Signal', until: 1.01 },
  ],

  openingBeat: 'Somewhere in the noise',
  tagline:
    "We build AI that takes intake, document prep, and reporting off your team's plate. Fixed prices, no lock-in, no noise.",
  filmCtaPrimary: 'Book a Free Call',
  filmCtaSecondary: 'See Pricing',

  manifesto: {
    leadIn: 'The premise',
    body: 'Most firms are drowning in AI <em>noise</em> — tools nobody uses, pilots that stall, spend nobody can measure. We find the <em>signal</em>: the hours your team loses every week, and the system that wins them back.',
  },

  capabilities: {
    leadIn: 'Pricing',
    headline: { lead: 'What It', emphasis: 'Costs.' },
    sub: 'Fixed prices for professional services firms with 10 to 100 people. Working systems inside the tools you already use, not chatbots.',
    items: [
      {
        num: '01',
        title: 'Workflow Assessment',
        desc: '$1,500. One week to map your workflows, find the three biggest time sinks, and price the fix.',
      },
      {
        num: '02',
        title: 'Automation Build',
        desc: 'From $5,000. One workflow automated inside your tools, measured against your baseline.',
      },
      {
        num: '03',
        title: 'Monthly Support',
        desc: 'From $750 / mo. We run, fix, and extend what we built. Month to month.',
      },
      {
        num: '04',
        title: 'Team Training',
        desc: 'Included. Your team learns to run and change everything we build.',
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
    sub: "Tell us what's eating your team's week. We'll tell you honestly whether AI can fix it, and exactly what it would cost.",
    primary: 'Book a Free 30-Minute Call',
    secondary: 'Enter the Full Site',
    fine: 'Discovery calls within 48h · Fixed prices · No lock-in',
  },

  footer: {
    copyright: `© ${identity.copyrightYear} ${identity.name}`,
    links: [
      { label: 'Home', href: '/' },
      { label: 'Privacy', href: '/privacy' },
      { label: 'Pricing', href: '#capabilities' },
    ],
  },

  loaderLabel: 'Calibrating receiver',
  scrollHint: 'Scroll to tune in',
};
