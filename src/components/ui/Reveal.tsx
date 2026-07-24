import { motion, type MotionProps } from 'motion/react';
import type { ReactNode } from 'react';

/** Signature easing used across all entrance animations — fast start, long luxurious settle. */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface RevealProps extends MotionProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  className?: string;
  once?: boolean;
}

/** Standard scroll-triggered reveal: rise + de-blur with the signature ease. */
export const Reveal = ({
  children,
  delay = 0,
  duration = 0.8,
  y = 28,
  className,
  once = true,
  ...rest
}: RevealProps) => (
  <motion.div
    initial={{ opacity: 0, y, filter: 'blur(6px)' }}
    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
    viewport={{ once, margin: '-10% 0px' }}
    transition={{ duration, ease: EASE, delay }}
    className={className}
    {...rest}
  >
    {children}
  </motion.div>
);
