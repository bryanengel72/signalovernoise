import { identity } from '../identity.js';
import type { IconKey } from '../icons.js';

export type AboutCopy = {
  eyebrow: string;
  headline: { lead: string; emphasis: string; trail: string };
  pillars: ReadonlyArray<{ icon: IconKey; label: string; title: string; desc: string }>;
  credentialsLabel: string;
  credentials: ReadonlyArray<string>;
};

export const aboutCopy: AboutCopy = {
  eyebrow: 'Why the Signal',
  headline: {
    lead: 'Authority is',
    emphasis: 'earned in production,',
    trail: 'not in slide decks.',
  },
  pillars: [
    {
      icon: 'cpu',
      label: 'Operations First',
      title: 'Process, Code, and AI.',
      desc: 'Twenty years running federal programs taught us how work really moves between people. We pair that with production engineering, so you get a working system, not a chatbot.',
    },
    {
      icon: 'trending-up',
      label: 'Business ROI',
      title: 'Strategy That Pays Off.',
      desc: "We time every task before we build anything, then measure against that baseline. If we can't track the impact, we don't take the project.",
    },
    {
      icon: 'shield',
      label: 'Confidentiality',
      title: 'Built for Client Data.',
      desc: "Your clients trust you with their finances, cases, and policies. We build inside your own accounts, use AI services that don't train on your data, and keep a person approving anything that reaches a client.",
    },
  ],
  credentialsLabel: `Verified Credentials — ${identity.founder}, Founder`,
  credentials: [
    'MindStudio Level 3 Certified',
    'PMP Certified Professional',
    'MBA + MS Innovation & Tech',
    'Former Program Manager — VA, DoD, USEUCOM, USAFRICOM, USNORTHCOM',
    '20+ Years Federal IT Program Management',
  ],
};
