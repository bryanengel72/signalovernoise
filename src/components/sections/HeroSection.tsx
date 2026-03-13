import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { useRef } from 'react';
import { ArrowRight, Crosshair } from 'lucide-react';

const HERO_IMAGE = 'https://www.maxim.com/wp-content/uploads/2021/05/gettyimages-595463638-radio-telescope-scaled.jpg';

interface HeroSectionProps {
  scrollTo: (id: string) => void;
}

export const HeroSection = ({ scrollTo }: HeroSectionProps) => {
  const ref = useRef<HTMLElement>(null);

  // Track scroll progress within the hero section
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  // Image moves up at 40% the rate of scroll — classic parallax
  const rawY = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const y = useSpring(rawY, { stiffness: 60, damping: 20 });

  // Subtle fade as you scroll away
  const opacity = useTransform(scrollYProgress, [0, 0.7], [0.4, 0.1]);

  // Content drifts up slightly faster (creates depth separation)
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '-12%']);

  return (
    <section ref={ref} className="relative min-h-[90vh] flex items-end border-b border-grid overflow-hidden">

      {/* Parallax background image */}
      <motion.img
        src={HERO_IMAGE}
        alt="Radio telescope against the night sky"
        style={{ y, opacity }}
        className="absolute inset-0 w-full h-[120%] -top-[10%] object-cover object-center will-change-transform"
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-bg/10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-bg/80 via-transparent to-transparent pointer-events-none" />

      {/* Content with subtle upward drift on scroll */}
      <motion.div
        style={{ y: contentY }}
        className="relative z-10 w-full max-w-4xl p-8 lg:p-16 pb-16 lg:pb-24 will-change-transform"
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
          Cut Through{' '}
          <span className="font-bold text-signal text-glow-signal">The Noise.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          className="text-muted text-sm lg:text-base max-w-lg mb-10 leading-relaxed"
        >
          Less noise. More signal. Measurable results.
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
            Explore Services
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => scrollTo('services')}
            className="px-8 py-4 text-sm font-semibold text-white border border-white/20 rounded-full hover:bg-white/5 glass transition-all"
          >
            Book Consultation
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
};
