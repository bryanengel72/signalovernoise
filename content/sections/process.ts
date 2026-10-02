export type ProcessCopy = {
  eyebrow: string;
  headline: { lead: string; emphasis: string };
  phases: ReadonlyArray<{ step: string; title: string; desc: string; tag: string }>;
};

export const processCopy: ProcessCopy = {
  eyebrow: 'How It Works',
  headline: { lead: 'Forward-Deployed,', emphasis: 'Not Bolted On.' },
  phases: [
    {
      step: '01',
      title: 'Map',
      desc: 'We sit down with the people who actually run the work, study how it moves through your systems, and map every step, handoff, and exception as it really happens.',
      tag: 'STAKEHOLDER-LED',
    },
    {
      step: '02',
      title: 'Re-engineer',
      desc: 'Every step gets sorted: delete it, automate it with simple rules, hand it to an AI agent, or keep a person in the loop. We baseline time and cost before anything is built.',
      tag: '1-2 WEEKS',
    },
    {
      step: '03',
      title: 'Deploy & Prove',
      desc: 'Agents go live inside the tools your team already uses, with training to run them. Then we measure against the baseline, so the results are proven, not promised.',
      tag: '90-DAY PROOF',
    },
  ],
};
