import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Crosshair } from 'lucide-react';
import { EASE } from '../ui/Reveal';

interface HeroSectionProps {
  scrollTo: (id: string) => void;
}

// The poster is the LCP element and the only asset fetched on first paint.
// It is frame 0 of the clip, so the handoff to motion has nothing to cross-fade
// between — the still simply starts moving. '/hero-radar.webp' is the previous
// art if you want the old look back.
const HERO_POSTER = '/hero-lock-poster.webp';
const HERO_VIDEO_WEBM = '/hero-lock.webm';
const HERO_VIDEO_MP4 = '/hero-lock.mp4';

const HERO_OPACITY = 0.73;

/** Desktop, motion-friendly, and not on a metered or slow connection. */
function shouldLoadVideo(): boolean {
  if (!window.matchMedia('(min-width: 1024px)').matches) return false;
  const conn = (navigator as { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (conn?.saveData) return false;
  if (conn?.effectiveType && /(^|-)2g$/.test(conn.effectiveType)) return false;
  return true;
}

export const HeroSection = ({ scrollTo }: HeroSectionProps) => {
  const ref = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefersReduced = useReducedMotion();
  const [videoPlaying, setVideoPlaying] = useState(false);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '-12%']);
  const rawY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const imgY = useSpring(rawY, { stiffness: 60, damping: 20 });

  // Nothing is fetched until this runs: the element ships with preload="none".
  // A missing or undecodable file simply never fires canplaythrough, leaving the
  // poster in place — so this is safe to deploy before the clip is encoded.
  useEffect(() => {
    if (prefersReduced || !shouldLoadVideo()) return;

    const video = videoRef.current;
    if (!video) return;

    const start = () => {
      video.play().then(() => setVideoPlaying(true)).catch(() => {});
    };

    video.addEventListener('canplaythrough', start, { once: true });
    video.preload = 'auto';
    video.load();

    return () => video.removeEventListener('canplaythrough', start);
  }, [prefersReduced]);

  return (
    <section ref={ref} className="relative min-h-[90vh] flex items-end border-b border-grid overflow-hidden bg-black">

      {/* Backdrop: poster cross-fades into the clip once it can play through */}
      <motion.div
        style={{ y: imgY }}
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.4, ease: EASE }}
        className="absolute inset-0 w-full h-[120%] -top-[10%] z-10 will-change-transform"
      >
        <motion.img
          src={HERO_POSTER}
          alt="A radio telescope dish silhouetted against a starfield, with a glowing signal waveform across it"
          fetchPriority="high"
          initial={{ opacity: 0 }}
          animate={{ opacity: videoPlaying ? 0 : HERO_OPACITY }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        <motion.video
          ref={videoRef}
          muted
          playsInline
          preload="none"
          aria-hidden="true"
          tabIndex={-1}
          initial={{ opacity: 0 }}
          animate={{ opacity: videoPlaying ? HERO_OPACITY : 0 }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          className="absolute inset-0 w-full h-full object-cover object-center"
        >
          {/* No loop: the dish locks on and holds the final frame, which
              resolves alongside the headline instead of resetting every 5s. */}
          <source src={HERO_VIDEO_WEBM} type="video/webm" />
          <source src={HERO_VIDEO_MP4} type="video/mp4" />
        </motion.video>
      </motion.div>

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
              initial={{ opacity: 0, y: 32, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.9, ease: EASE, delay }}
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
          className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-10 text-xs tracking-widest uppercase text-white/40"
        >
          <span className="whitespace-nowrap">No Lock-In</span>
          <span className="text-white/20">·</span>
          <span className="whitespace-nowrap">90-Day ROI Focus</span>
          <span className="text-white/20">·</span>
          <span className="whitespace-nowrap">Professional-Grade</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.75 }}
          className="flex flex-wrap items-center gap-6"
        >
          <motion.button
            onClick={() => scrollTo('contact')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="relative overflow-hidden bg-signal text-black px-8 py-4 text-sm font-semibold rounded-full hover:glow-signal border border-signal transition-shadow flex items-center gap-2 group"
          >
            <span className="btn-shine" aria-hidden="true" />
            Get Your Free AI Audit
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </motion.button>
          <button
            data-cal-link="bryan-engel-amlxcu/30min"
            className="px-8 py-4 text-sm font-semibold text-white border border-white/20 rounded-full hover:bg-white/10 glass transition-all"
          >
            Book Consultation
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
        <span className="text-[10px] tracking-[0.3em] uppercase [writing-mode:vertical-rl]">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-[1px] h-10 bg-gradient-to-b from-signal to-transparent"
        />
      </motion.div>
    </section>
  );
};
