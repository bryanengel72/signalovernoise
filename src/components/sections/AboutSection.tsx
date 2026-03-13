import { motion } from 'motion/react';
import { Cpu, TrendingUp, Network, ChevronRight } from 'lucide-react';

const pillars = [
  {
    icon: Cpu,
    label: 'Technical Architecture',
    title: 'Systems, Not Prompts.',
    desc: 'Led by an AI Agent Developer with an MS in Innovation & Technology. Every solution is engineered as a deployable system — not a wrapper around a chatbot.',
  },
  {
    icon: TrendingUp,
    label: 'Business ROI',
    title: 'MBA-Backed Strategy.',
    desc: 'Every engagement is scoped around bottom-line efficiency metrics and scalable growth targets. If the ROI cannot be measured, the project is not scoped.',
  },
  {
    icon: Network,
    label: 'Advanced Frameworks',
    title: '"Council of 5" Architecture.',
    desc: 'Pioneers of multi-perspective decision engines. Our proprietary agentic framework deploys five specialized agents in parallel to synthesize high-fidelity outputs with built-in adversarial review.',
  },
];

const credentials = [
  'MindStudio Level 3 Certified',
  'PMP Certified Professional',
  'MBA + MS Innovation & Tech',
  'Former Program Manager — VA, DoD, USEUCOM, USAFRICOM, USNORTHCOM',
  '20+ Years Federal IT Program Management',
];

export const AboutSection = () => {
  return (
    <section className="border-b border-grid" id="about">
      {/* Section header */}
      <div className="p-8 lg:p-16 border-b border-grid">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs text-signal tracking-widest uppercase mb-8 flex items-center gap-4"
        >
          <div className="w-2 h-2 bg-signal" />
          Why the Signal
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-5xl lg:text-6xl font-light tracking-tight max-w-3xl"
        >
          Authority is{' '}
          <span className="font-bold text-signal text-glow-signal">earned in production,</span>
          <br />not in slide decks.
        </motion.h2>
      </div>

      {/* 3-pillar grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 border-b border-grid">
        {pillars.map((pillar, i) => {
          const Icon = pillar.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.6, ease: 'easeOut' }}
              className={`p-8 lg:p-12 relative group ${i < 2 ? 'border-b lg:border-b-0 lg:border-r border-grid' : ''}`}
            >
              {/* Top accent */}
              <div className="absolute top-0 left-8 lg:left-12 w-16 h-[2px] bg-signal opacity-60" />

              <div className="w-12 h-12 border border-signal/30 rounded-full flex items-center justify-center text-signal bg-signal/5 mb-8 group-hover:bg-signal/10 transition-colors duration-300">
                <Icon size={20} />
              </div>

              <div className="text-[10px] text-signal tracking-widest uppercase mb-3">{pillar.label}</div>
              <h3 className="font-display text-2xl font-bold text-white mb-4 tracking-tight">{pillar.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{pillar.desc}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Credentials row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="p-8 lg:p-16 bg-surface/40"
      >
        <div className="text-[10px] text-muted tracking-widest uppercase mb-6">Verified Credentials — Bryan Engel, Founder</div>
        <div className="flex flex-wrap gap-x-10 gap-y-3">
          {credentials.map((cred, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-muted">
              <ChevronRight size={12} className="text-signal flex-shrink-0" />
              <span>{cred}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};
