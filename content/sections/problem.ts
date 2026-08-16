import type { IconKey } from '../icons';

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
  headline: { lead: 'The Cost of Operating', emphasis: 'Without an AI Framework.' },
  intro:
    'Most businesses are treating AI like an experiment. The result: wasted time, failed tools, and nothing to show for the investment.',
  cards: [
    {
      icon: 'activity',
      title: 'Scattered Data',
      desc: 'Data spread across too many places wastes hours every week without producing anything useful.',
    },
    {
      icon: 'database',
      title: 'Process Inefficiency',
      desc: 'Repetitive manual work eats up time that should go toward growth and higher-value tasks.',
    },
    {
      icon: 'terminal',
      title: 'AI Tools That Never Stick',
      desc: 'Most AI experiments never make it into daily use — they stall out before anyone sees results.',
    },
    {
      icon: 'cpu',
      title: 'No Clear Plan',
      desc: 'Without a prioritized roadmap, AI spending is scattered and nothing gets measured.',
    },
  ],
};
