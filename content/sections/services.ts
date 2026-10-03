export type ServicesCopy = {
  eyebrow: string;
  headline: { lead: string; emphasis: string };
  intro: string;
  /** `price` is optional: an offer can be shown without one. */
  services: ReadonlyArray<{ num: string; title: string; price?: string; desc: string }>;
};

export const servicesCopy: ServicesCopy = {
  eyebrow: 'Offers & Pricing',
  headline: { lead: 'What It', emphasis: 'Costs.' },
  intro:
    "Start with a one-week assessment. You'll know exactly where AI saves your firm time and what it costs to build, and the fee counts toward your first build.",
  services: [
    {
      num: '01',
      title: 'Workflow Assessment',
      price: '$1,500',
      desc: 'One week. We map how work moves through your firm, find the three biggest time sinks, and hand you a fixed-price plan to fix them.',
    },
    {
      num: '02',
      title: 'Automation Build',
      price: 'From $5,000',
      desc: 'One workflow automated inside the tools you already use: intake, document prep, reporting, or inbox triage. Fixed scope, measured against your baseline.',
    },
    {
      num: '03',
      title: 'Monthly Support',
      price: 'From $750 / mo',
      desc: "We run, monitor, and fix what we built, and add the next workflow when you're ready. Month to month.",
    },
    {
      num: '04',
      title: 'Team Training',
      price: 'Included',
      desc: 'Every build ends with your team trained to run it and change it, so a small fix never needs a call to us.',
    },
  ],
};
