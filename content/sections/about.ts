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
      label: 'Technical Architecture',
      title: 'Systems, Not Prompts.',
      desc: 'Led by an AI developer with an MS in Innovation & Technology. Every solution is a real working system — not just a chatbot.',
    },
    {
      icon: 'trending-up',
      label: 'Business ROI',
      title: 'Strategy That Pays Off.',
      desc: "Every engagement is built around measurable results and growth targets. If we can't track the impact, we don't take the project.",
    },
    {
      icon: 'network',
      label: 'Advanced Frameworks',
      title: '"Council of 5" Architecture.',
      desc: 'Our proprietary "Council of 5" system runs five specialized AI roles in parallel — each one checking the others\' work — to deliver better, more reliable results.',
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
