import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { useRef } from 'react';
import { ArrowRight, Crosshair } from 'lucide-react';

interface HeroSectionProps {
  scrollTo: (id: string) => void;
}

const HERO_IMAGE = 'https://www.maxim.com/wp-content/uploads/2021/05/gettyimages-595463638-radio-telescope-scaled.jpg';

export const HeroSection = ({ scrollTo }: HeroSectionProps) => {
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '-12%']);
  const rawY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const imgY = useSpring(rawY, { stiffness: 60, damping: 20 });

  return (
    <section ref={ref} className="relative min-h-[90vh] flex items-end border-b border-grid overflow-hidden bg-black">

      {/* 1. Higher Opacity Image */}
      <motion.img
        src={HERO_IMAGE}
        alt="Radio telescope"
        style={{ y: imgY }}
        className="absolute inset-0 w-full h-[120%] -top-[10%] object-cover object-center opacity-77 z-10 will-change-transform"
      />

      {/* 2. Refined Overlay: Darker on left (text side), clear on right (image side) */}
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
          <span>B2B AI Consulting</span>
        </motion.div>

        <h1 className="font-display text-5xl lg:text-8xl tracking-tight mb-8 leading-tight">
          {[
            { text: 'Simple AI.', delay: 0.1, bold: false },
            { text: 'Clear Strategy.', delay: 0.25, bold: false },
            { text: 'Real Growth.', delay: 0.4, bold: true },
          ].map(({ text, delay, bold }) => (
            <motion.span
              key={text}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay }}
              className={`block ${bold ? 'font-bold text-signal text-glow-signal' : 'font-light text-white'}`}
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
          We build custom AI systems that cut costs, accelerate decisions, and deliver measurable ROI — without the hype, lock-in, or guesswork.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.65 }}
          className="flex items-center gap-6 mb-10 text-xs tracking-widest uppercase text-white/40"
        >
          <span>No Lock-In</span>
          <span className="text-white/20">·</span>
          <span>90-Day ROI Focus</span>
          <span className="text-white/20">·</span>
          <span>Enterprise-Grade</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.75 }}
          className="flex flex-wrap items-center gap-6"
        >
          <button
            onClick={() => scrollTo('contact')}
            className="bg-signal text-black px-8 py-4 text-sm font-semibold rounded-full hover:glow-signal border border-signal transition-all flex items-center gap-2 group"
          >
            Get Your Free AI Audit
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            data-cal-link="bryan-engel-amlxcu/30min"
            className="px-8 py-4 text-sm font-semibold text-white border border-white/20 rounded-full hover:bg-white/10 glass transition-all"
          >
            Book Consultation
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
};