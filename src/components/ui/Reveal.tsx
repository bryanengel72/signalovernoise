import { motion } from 'motion/react';
import type { ReactNode } from 'react';

/** Signature easing used across all entrance animations — fast start, long luxurious settle. */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * The site's entrance vocabulary.
 *
 * Before this module held it, the same reveal preamble was hand-rolled in every
 * Section with twelve different rise distances and four different easings — a
 * system only in the comments. These four variants cover every scroll entrance
 * the site actually uses.
 */
const ENTER = {
  rise: { opacity: 0, y: 28, filter: 'blur(6px)' },
  fade: { opacity: 0 },
  slide: { opacity: 0, x: -16 },
  scale: { opacity: 0, scale: 0.95 },
} as const;

const SETTLED = {
  rise: { opacity: 1, y: 0, filter: 'blur(0px)' },
  fade: { opacity: 1 },
  slide: { opacity: 1, x: 0 },
  scale: { opacity: 1, scale: 1 },
} as const;

export type RevealVariant = keyof typeof ENTER;

type RevealOptions = {
  delay?: number;
  duration?: number;
  /** Re-reveal on every pass. Off by default — reveals fire once. */
  repeat?: boolean;
};

/**
 * The reveal policy as spreadable motion props, for the cases that must render
 * a specific element — an `h2`, a `form`, a `footer`. Everything else uses
 * `<Reveal>`, which is this applied to a div.
 */
export const reveal = (
  variant: RevealVariant = 'rise',
  { delay = 0, duration = 0.7, repeat = false }: RevealOptions = {},
) => ({
  initial: ENTER[variant],
  whileInView: SETTLED[variant],
  viewport: { once: !repeat, margin: '-10% 0px' },
  transition: { duration, ease: EASE, delay },
});

type RevealProps = RevealOptions & {
  children: ReactNode;
  variant?: RevealVariant;
  className?: string;
};

/** Standard scroll-triggered reveal. Renders one div, so it drops straight into a grid. */
export const Reveal = ({ children, variant = 'rise', className, ...options }: RevealProps) => (
  <motion.div {...reveal(variant, options)} className={className}>
    {children}
  </motion.div>
);
