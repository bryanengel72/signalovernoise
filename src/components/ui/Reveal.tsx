import type { CSSProperties, ReactNode } from 'react';

/** Signature easing used across all entrance animations — fast start, long luxurious settle. */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * The site's scroll-entrance vocabulary: rise, fade, slide, scale.
 *
 * These used to be Motion `initial`/`whileInView` props, which rendered every
 * Section at opacity 0 in the pre-rendered HTML — so a crawler, or Google's
 * rendered snapshot, saw the text as hidden until something scrolled it into
 * view. Now the markup is only marked up: it renders visible on the server and
 * on first paint, and src/revealOnScroll.ts hides just the elements still below
 * the fold once the page is live, then reveals each as it arrives. The
 * variants themselves are CSS, in src/index.css.
 */

export type RevealVariant = 'rise' | 'fade' | 'slide' | 'scale';

type RevealOptions = {
  delay?: number;
  duration?: number;
};

/**
 * The reveal as spreadable props, for the cases that must render a specific
 * element — an `h2`, a `form`, a `footer`. Everything else uses `<Reveal>`.
 */
export const reveal = (
  variant: RevealVariant = 'rise',
  { delay = 0, duration = 0.7 }: RevealOptions = {},
) => ({
  'data-reveal': variant,
  style: {
    '--reveal-delay': `${delay}s`,
    '--reveal-duration': `${duration}s`,
  } as CSSProperties,
});

type RevealProps = RevealOptions & {
  children: ReactNode;
  variant?: RevealVariant;
  className?: string;
};

/** Standard scroll-triggered reveal. Renders one div, so it drops straight into a grid. */
export const Reveal = ({ children, variant = 'rise', className, ...options }: RevealProps) => (
  <div {...reveal(variant, options)} className={className}>
    {children}
  </div>
);
