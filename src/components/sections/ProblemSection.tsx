import { m, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useRef } from 'react';
import { problemCopy, type ProblemCopy } from '@/content/sections/problem';
import { ICONS } from '../ui/icons';
import { Reveal, reveal } from '../ui/Reveal';
import { SectionHeader } from '../ui/SectionHeader';

type Card = ProblemCopy['cards'][number];

function TiltCard({ item, index }: { item: Card; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 20 });
  const springY = useSpring(y, { stiffness: 200, damping: 20 });
  const rotateX = useTransform(springY, [-50, 50], [8, -8]);
  const rotateY = useTransform(springX, [-50, 50], [-8, 8]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };

  const Icon = ICONS[item.icon];

  return (
    <m.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 800 }}
      className="h-full p-8 border border-white/5 rounded-2xl glass hover:border-signal/30 transition-colors duration-300 relative group overflow-hidden cursor-default"
    >
      <m.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 30%, color-mix(in srgb, var(--color-signal) 7%, transparent) 0%, transparent 70%)' }}
      />
      <m.div
        className="absolute top-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-signal to-transparent w-full opacity-0 group-hover:opacity-100"
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.4 }}
      />
      <div className="relative w-12 h-12 mb-6">
        <div
          className="loop-ring absolute inset-0 rounded-full border border-signal/30"
          style={{ animationDelay: `${index * 0.3}s` }}
        />
        <m.div
          className="w-12 h-12 rounded-full bg-signal/10 flex items-center justify-center text-signal border border-signal/20 group-hover:bg-signal/20 group-hover:border-signal/50 transition-colors duration-300"
          whileHover={{ rotate: [0, -8, 8, 0] }}
          transition={{ duration: 0.4 }}
        >
          <Icon size={18} />
        </m.div>
      </div>
      <m.h3 className="font-display text-xl font-bold mb-3 text-white group-hover:text-signal transition-colors duration-300">
        {item.title}
      </m.h3>
      <p className="text-xs text-muted leading-relaxed group-hover:text-text/60 transition-colors duration-300">
        {item.desc}
      </p>
      <div
        className="loop-beat absolute bottom-4 right-4 w-1.5 h-1.5 rounded-full bg-signal opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ animationDelay: `${index * 0.4}s` }}
      />
    </m.div>
  );
}

export const ProblemSection = ({ copy = problemCopy }: { copy?: ProblemCopy }) => {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 border-b border-grid">
      <div className="lg:col-span-5 p-8 lg:p-16 border-b lg:border-b-0 lg:border-r border-grid">
        <SectionHeader
          eyebrow={copy.eyebrow}
          headline={copy.headline}
          compact
          looseEyebrow
          headlineClassName="mb-6"
        />
        <p {...reveal('rise', { delay: 0.15 })} className="text-sm text-muted leading-relaxed">
          {copy.intro}
        </p>
      </div>
      <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 p-8 lg:p-16" style={{ perspective: '1000px' }}>
        {copy.cards.map((item, i) => (
          // The entrance lives on a wrapper: the card's own transform carries the tilt.
          <Reveal key={item.title} delay={i * 0.12} duration={0.6}>
            <TiltCard item={item} index={i} />
          </Reveal>
        ))}
      </div>
    </section>
  );
};
