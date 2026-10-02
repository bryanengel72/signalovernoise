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
    'We work as forward-deployed engineers: embedded with your team, building inside your systems, until the work runs. Engagements span healthcare IT, veterinary, legal, media, and professional services.',
  services: [
    {
      num: '01',
      title: 'Workflow Automation',
      desc: 'Map how work really flows, re-engineer it, then automate what should be automated.',
    },
    {
      num: '02',
      title: 'Custom AI Agents',
      desc: 'Agents that work inside the tools you already use. No new app to learn.',
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
