export type ServicesCopy = {
  eyebrow: string;
  headline: { lead: string; emphasis: string };
  intro: string;
  services: ReadonlyArray<{ num: string; title: string; desc: string }>;
};

export const servicesCopy: ServicesCopy = {
  eyebrow: 'Capabilities',
  headline: { lead: 'What We', emphasis: 'Build.' },
  intro:
    'Every engagement is scoped for your specific context. We work across verticals including healthcare IT, veterinary, legal, media, and professional services.',
  services: [
    {
      num: '01',
      title: 'Workflow Automation',
      desc: 'Map manual processes, identify ROI targets, build workflows.',
    },
    {
      num: '02',
      title: 'Custom AI Agents',
      desc: 'Purpose-built agents for specific jobs inside your business.',
    },
    {
      num: '03',
      title: 'Strategy & Roadmap',
      desc: 'Clear, prioritized 90-day AI roadmap tailored to your team.',
    },
    {
      num: '04',
      title: 'Training & Handoff',
      desc: "Build your team's capability to maintain and expand.",
    },
  ],
};
