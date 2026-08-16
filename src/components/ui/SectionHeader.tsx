import { motion } from 'motion/react';
import { Reveal, reveal } from './Reveal';

/**
 * The eyebrow-and-headline block every Section opens with.
 *
 * It was duplicated six times and had already drifted twice — one Section gave
 * its dot a `rounded-full`, another weakened its highlight to `font-semibold`.
 * Both were slips, so the module renders the majority: a square dot and a bold
 * highlight. The two differences that read as deliberate — Problem's smaller
 * headline and the looser eyebrow spacing — are props.
 */
type SectionHeaderProps = {
  eyebrow: string;
  headline: { lead: string; emphasis: string; trail?: string };
  /** Problem sets its headline a step down from the other five. */
  compact?: boolean;
  /** Problem and Contact space the eyebrow further from the headline. */
  looseEyebrow?: boolean;
  /** Layout the surrounding Section owns — `max-w-3xl`, a bottom margin. */
  headlineClassName?: string;
};

const HEADLINE_SIZE = {
  default: 'text-5xl lg:text-6xl',
  compact: 'text-4xl lg:text-5xl leading-tight',
};

export const SectionHeader = ({
  eyebrow,
  headline,
  compact = false,
  looseEyebrow = false,
  headlineClassName = '',
}: SectionHeaderProps) => (
  <>
    <Reveal
      variant="fade"
      className={`text-xs text-signal tracking-widest uppercase ${looseEyebrow ? 'mb-12' : 'mb-8'} flex items-center gap-4`}
    >
      <div className="w-2 h-2 bg-signal" />
      {eyebrow}
    </Reveal>

    <motion.h2
      {...reveal('rise')}
      className={`font-display ${compact ? HEADLINE_SIZE.compact : HEADLINE_SIZE.default} font-light tracking-tight ${headlineClassName}`}
    >
      {headline.lead}{' '}
      <span className="font-bold text-signal text-glow-signal">{headline.emphasis}</span>
      {headline.trail && (
        <>
          <br />
          {headline.trail}
        </>
      )}
    </motion.h2>
  </>
);
