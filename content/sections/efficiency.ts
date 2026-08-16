export type EfficiencyRow = {
  process: string;
  before: string;
  after: string;
  gain: string;
};

export type EfficiencyCopy = {
  eyebrow: string;
  headline: { lead: string; emphasis: string };
  intro: string;
  columns: { process: string; before: string; after: string; gain: string };
  rows: ReadonlyArray<EfficiencyRow>;
};

export const efficiencyCopy: EfficiencyCopy = {
  eyebrow: 'Real Results',
  headline: { lead: 'Before vs.', emphasis: 'After.' },
  intro: 'Real results from businesses like yours — before and after automation.',
  columns: {
    process: 'Process',
    before: 'Manual Operation',
    after: 'With Automation',
    gain: 'Delta',
  },
  rows: [
    { process: 'Data Synthesis', before: '10 hrs / week', after: '< 5 min', gain: '99% time reduction' },
    { process: 'Lead Qualification', before: '3 hrs / day', after: 'Real-time', gain: 'Continuous pipeline' },
    { process: 'Report Generation', before: '4 hrs / cycle', after: 'On-demand', gain: 'Zero human overhead' },
    { process: 'Email Triage & Routing', before: '90 min / day', after: 'Automated', gain: '100% coverage' },
    { process: 'Competitive Intelligence', before: '6 hrs / week', after: 'Daily digest', gain: 'Always current' },
  ],
};
