import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import type { RefObject } from 'react';
import type { HeroCopy } from '@/content/sections/hero';
import { EASE } from './Reveal';

/**
 * The Hero's cinematic backdrop: a seamless loop of the signal lock, parallaxed
 * by scroll, with a slow load-in settle. Reduced-motion visitors get the poster
 * still instead of the video.
 *
 * This was two near-identical branches inside HeroSection — same parallax value,
 * same initial scale, and a character-identical 100-character className — that
 * had quietly diverged on two numbers. They are now one element with one
 * settle table, so a future change lands in one place.
 */

/**
 * The still lands slightly dimmer and settles a touch faster than the video.
 * Preserved rather than reconciled: the difference predates this module and
 * nothing recorded whether it was chosen or drifted. Collapsing these to one
 * row is a deliberate art decision, not a refactor.
 */
const SETTLE = {
  still: { opacity: 0.85, duration: 1.2 },
  video: { opacity: 0.9, duration: 1.4 },
} as const;

const LAYER =
  'absolute inset-0 w-full h-[120%] -top-[10%] object-cover object-center z-10 will-change-transform';

type HeroBackdropProps = {
  /** The Section the parallax is measured against. */
  targetRef: RefObject<HTMLElement | null>;
  backdrop: HeroCopy['backdrop'];
};

export const HeroBackdrop = ({ targetRef, backdrop }: HeroBackdropProps) => {
  const prefersReduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end start'],
  });
  const y = useSpring(useTransform(scrollYProgress, [0, 1], ['0%', '30%']), {
    stiffness: 60,
    damping: 20,
  });

  const settle = prefersReduced ? SETTLE.still : SETTLE.video;
  const shared = {
    style: { y },
    initial: { scale: 1.08, opacity: 0 },
    animate: { scale: 1, opacity: settle.opacity },
    transition: {
      scale: { duration: 2.4, ease: EASE },
      opacity: { duration: settle.duration, ease: 'easeOut' as const },
    },
    className: LAYER,
  };

  if (prefersReduced) {
    return (
      <motion.img
        {...shared}
        src={backdrop.poster}
        alt={backdrop.posterAlt}
        fetchPriority="high"
      />
    );
  }

  return (
    <motion.video {...shared} autoPlay muted loop playsInline poster={backdrop.poster} aria-hidden="true">
      {backdrop.sources.map((source) => (
        <source key={source.src} src={source.src} type={source.type} />
      ))}
    </motion.video>
  );
};
