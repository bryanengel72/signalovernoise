import { motion, useScroll, useTransform } from 'motion/react';
import { Fragment, useRef } from 'react';
import { ArrowRight, Crosshair } from 'lucide-react';
import { heroCopy, type HeroCopy } from '@/content/sections/hero';
import { HeroBackdrop } from '../ui/HeroBackdrop';
import { EASE } from '../ui/Reveal';

interface HeroSectionProps {
  copy?: HeroCopy;
}

/** Headline lines stagger in: 0.10s, 0.25s, 0.40s. */
const headlineDelay = (index: number) => 0.1 + index * 0.15;

export const HeroSection = ({ copy = heroCopy }: HeroSectionProps) => {
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '-12%']);

  return (
    <section ref={ref} className="relative min-h-[90vh] flex items-end border-b border-grid overflow-hidden bg-black">

      <HeroBackdrop targetRef={ref} backdrop={copy.backdrop} />

      {/* Refined Overlay: Darker on left (text side), clear on right (image side) */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-20 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-20 pointer-events-none" />

      {/* Content */}
      <motion.div
        style={{ y: contentY }}
        className="relative z-40 w-full max-w-4xl p-8 lg:p-16 pb-16 lg:pb-24 will-change-transform"
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4 text-signal text-xs tracking-widest uppercase mb-8"
        >
          <Crosshair size={14} />
          <span>{copy.eyebrow}</span>
        </motion.div>

        <h1 className="font-display text-5xl lg:text-8xl tracking-tight mb-8 leading-tight">
          {copy.headline.map(({ text, emphasis }, i) => (
            <motion.span
              key={text}
              initial={{ opacity: 0, y: 32, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.9, ease: EASE, delay: headlineDelay(i) }}
              className={`block ${emphasis ? 'font-bold text-signal text-glow-signal' : 'font-light text-white'}`}
            >
              {text}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.55 }}
          className="text-white/80 text-sm lg:text-base max-w-xl mb-8 leading-relaxed"
        >
          {copy.subhead}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.65 }}
          className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-10 text-xs tracking-widest uppercase text-white/40"
        >
          {copy.trustChips.map((chip, i) => (
            <Fragment key={chip}>
              {i > 0 && <span className="text-white/20">·</span>}
              <span className="whitespace-nowrap">{chip}</span>
            </Fragment>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.75 }}
          className="flex flex-wrap items-center gap-6"
        >
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="relative overflow-hidden bg-signal text-black px-8 py-4 text-sm font-semibold rounded-full hover:glow-signal border border-signal transition-shadow flex items-center gap-2 group"
          >
            <span className="btn-shine" aria-hidden="true" />
            {copy.primaryCta}
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </motion.a>
          <button
            data-cal-link={copy.bookingSlug}
            className="px-8 py-4 text-sm font-semibold text-white border border-white/20 rounded-full hover:bg-white/10 glass transition-all"
          >
            {copy.secondaryCta}
          </button>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="absolute bottom-6 right-8 lg:right-16 z-40 hidden lg:flex flex-col items-center gap-2 text-white/40"
      >
        <span className="text-[10px] tracking-[0.3em] uppercase [writing-mode:vertical-rl]">{copy.scrollCue}</span>
        <motion.div
          animate={{ y: [0, 8, 0], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-[1px] h-10 bg-gradient-to-b from-signal to-transparent"
        />
      </motion.div>
    </section>
  );
};
