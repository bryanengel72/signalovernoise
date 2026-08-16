/**
 * Identity — the consultancy's contact facts.
 *
 * Referenced from both sides of the network seam (browser and serverless
 * function) and from more than one Section, so it lives here rather than in any
 * module that renders it. Before this module existed the email address appeared
 * at ten sites across six modules, and one of them was misspelled.
 *
 * Framework-free: this is compiled twice, once by Vite into the browser bundle
 * and once by Vercel into the function. No React, no JSX, no import.meta.env.
 */

export const identity = {
  name: 'Signal Over Noise AI',
  /** Wordmark as it appears in the navbar — deliberately shorter than the legal name. */
  shortName: 'Signal Over Noise',
  founder: 'Bryan Engel',
  founderTitle: 'Founder & Principal AI Consultant',
  email: 'bryan@signalovernoiseai.com',
  domain: 'signalovernoiseai.com',
  siteUrl: 'https://www.signalovernoiseai.com',
  linkedin: 'https://www.linkedin.com/in/bryanengel/',
  copyrightYear: 2026,

  /** Cal.com element-click embed. The namespace must match index.html's Cal("init", ...). */
  booking: {
    slug: 'bryan-engel-amlxcu/30min',
    namespace: '30min',
    config: '{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}',
  },
} as const;

export type Identity = typeof identity;
