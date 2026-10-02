export type EfficiencyRow = {
  process: string;
  before: string;
  after: string;
  gain: string;
};

/**
 * One engagement told in more than a row: who the team was, and the before and
 * after at more than one level. Optional — the table stands on its own.
 */
export type FeaturedCase = {
  label: string;
  title: string;
  context: string;
  stats: ReadonlyArray<{ label: string; before: string; after: string; gain: string }>;
  note: string;
};

export type EfficiencyCopy = {
  eyebrow: string;
  headline: { lead: string; emphasis: string };
  intro: string;
  featured?: FeaturedCase;
  columns: { process: string; before: string; after: string; gain: string };
  rows: ReadonlyArray<EfficiencyRow>;
};

export const efficiencyCopy: EfficiencyCopy = {
  eyebrow: 'Real Results',
  headline: { lead: 'Before vs.', emphasis: 'After.' },
  intro: 'Real results from businesses like yours — before and after automation.',
  featured: {
    label: 'Featured Engagement',
    title: 'Radio Waveform Analysis',
    context:
      'A 12-person engineering team, each specialist owning a portion of a technical waveform analysis.',
    stats: [
      { label: 'Team analysis cycle', before: '60 days', after: '30 days', gain: '50% faster' },
      { label: "One SME's review", before: '120 hrs', after: '5 hrs', gain: '96% less time' },
    ],
    note: "Team working time only. About 30 days of external dependencies sit outside the team's control and are excluded.",
  },
  columns: {
    process: 'Process',
    before: 'Manual Operation',
    after: 'With Automation',
    gain: 'Delta',
  },
  rows: [
    { process: 'Executive Financial Dashboard', before: '2 hrs / report', after: '3 min', gain: '97% time reduction' },
    { process: 'Data Synthesis', before: '10 hrs / week', after: '< 5 min', gain: '99% time reduction' },
    { process: 'Lead Qualification', before: '3 hrs / day', after: 'Real-time', gain: 'Continuous pipeline' },
    { process: 'Report Generation', before: '4 hrs / cycle', after: 'On-demand', gain: 'Zero human overhead' },
    { process: 'Email Triage & Routing', before: '90 min / day', after: 'Automated', gain: '100% coverage' },
    { process: 'Competitive Intelligence', before: '6 hrs / week', after: 'Daily digest', gain: 'Always current' },
  ],
};
