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
    <section ref={ref} className="relative min-h-[90vh] flex items-end border-b border-grid overflow-hidden bg-bg">

      {/* Background stack */}
      <div className="absolute inset-0 bg-bg z-0" />
      
      {/* 1. The Telescope Image (Focal Background) */}
      <motion.img
        src={HERO_IMAGE}
        alt="Radio telescope"
        style={{ y: imgY }}
        className="absolute inset-0 w-full h-[120%] -top-[10%] object-cover object-center opacity-40 z-10 will-change-transform"
      />

      {/* 2. Legibility Gradients (Protects text) */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent z-20 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/40 to-transparent z-20 pointer-events-none" />

      {/* 3. Content Protection Gradient (bottom fade only) */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-transparent z-30 pointer-events-none" />

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
          <span>AI Signal Intelligence</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
          className="font-display text-5xl lg:text-8xl font-light tracking-tight mb-8 leading-tight"
        >
          Automate the Noise.{' '}
          <span className="font-bold text-signal text-glow-signal">Scale the Signal.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          className="text-muted text-sm lg:text-base max-w-xl mb-10 leading-relaxed"
        >
          We engineer custom AI agentic workflows that eliminate operational friction for B2B enterprises. Move past the hype with ROI-driven automation.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
          className="flex flex-wrap items-center gap-6"
        >
          <button
            onClick={() => scrollTo('contact')}
            className="bg-signal text-bg px-8 py-4 text-sm font-semibold rounded-full hover:glow-signal border border-signal transition-all flex items-center gap-2 group"
          >
            Request an Efficiency Audit
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            data-cal-link="bryan-engel-amlxcu/30min"
            data-cal-namespace="30min"
            data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
            className="px-8 py-4 text-sm font-semibold text-white border border-white/20 rounded-full hover:bg-white/5 glass transition-all"
          >
            Book Consultation
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
};
