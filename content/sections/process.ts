export type ProcessCopy = {
  eyebrow: string;
  headline: { lead: string; emphasis: string };
  phases: ReadonlyArray<{ step: string; title: string; desc: string; tag: string }>;
};

export const processCopy: ProcessCopy = {
  eyebrow: 'How It Works',
  headline: { lead: 'How It', emphasis: 'Works.' },
  phases: [
    {
      step: '01',
      title: 'Discover',
      desc: 'Map how your business operates today, find the biggest time-wasters, and identify where automation can help most.',
      tag: '30-60 MIN SCAN',
    },
    {
      step: '02',
      title: 'Design',
      desc: 'Plan the solution. Define exactly what to build, what tools to use, and how everything connects.',
      tag: '1-2 WEEKS',
    },
    {
      step: '03',
      title: 'Deploy',
      desc: 'Build, test, and launch in your environment. You leave with working automation and training to use it.',
      tag: 'LIVE SYSTEM',
    },
  ],
};
