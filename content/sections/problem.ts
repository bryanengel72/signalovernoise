import type { IconKey } from '../icons.js';

/**
 * Problem Copy.
 *
 * `icon` is a key, not a component — Copy stays framework-free and the Section
 * owns the key-to-icon mapping. The previous data carried a `color` field on
 * every entry that nothing ever read; it is gone.
 */
export type ProblemCopy = {
  eyebrow: string;
  headline: { lead: string; emphasis: string };
  intro: string;
  cards: ReadonlyArray<{ icon: IconKey; title: string; desc: string }>;
};

export const problemCopy: ProblemCopy = {
  eyebrow: 'The Problem',
  headline: { lead: 'Your Best People Are', emphasis: 'Doing Admin.' },
  intro:
    'Client work pays the bills. The admin around it (intake, document prep, status reports, the inbox) eats the hours your team should be spending on clients.',
  cards: [
    {
      icon: 'database',
      title: 'Intake by Hand',
      desc: 'New clients send documents by email and answer the same questions every time. Someone on your team retypes all of it.',
    },
    {
      icon: 'activity',
      title: 'Reports Rebuilt Every Cycle',
      desc: 'Month-end packages, status updates, and client summaries get rebuilt by hand from the same sources, again and again.',
    },
    {
      icon: 'network',
      title: 'Inboxes Nobody Owns',
      desc: 'Client requests land in shared and personal inboxes. Some sit for days, and partners end up doing the sorting.',
    },
    {
      icon: 'terminal',
      title: 'AI Tools That Never Stuck',
      desc: 'Someone bought an AI subscription. A few people tried it. Six months later, nothing in the firm works differently.',
    },
  ],
};
