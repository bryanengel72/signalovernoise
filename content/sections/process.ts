export type ProcessCopy = {
  eyebrow: string;
  headline: { lead: string; emphasis: string };
  phases: ReadonlyArray<{ step: string; title: string; desc: string; tag: string }>;
};

export const processCopy: ProcessCopy = {
  eyebrow: 'How It Works',
  headline: { lead: 'Built Into Your Firm,', emphasis: 'Not Bolted On.' },
  phases: [
    {
      step: '01',
      title: 'Map',
      desc: 'We sit down with the people who do the work and map how a client request actually moves through your firm: every step, handoff, and workaround.',
      tag: 'WEEK 1',
    },
    {
      step: '02',
      title: 'Re-engineer',
      desc: "Every step gets sorted: delete it, automate it with simple rules, hand it to AI, or keep a person on it. We time each one first, so you know what you're buying back.",
      tag: 'FIXED-PRICE PLAN',
    },
    {
      step: '03',
      title: 'Deploy & Prove',
      desc: 'The automation goes live inside the tools your team already uses, with a person approving anything that reaches a client. We train your team, then measure against the baseline.',
      tag: '90-DAY PROOF',
    },
  ],
};
