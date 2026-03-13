import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

const rows = [
  {
    process:  'Data Synthesis',
    before:   '10 hrs / week',
    after:    '< 5 min',
    gain:     '99% time reduction',
  },
  {
    process:  'Lead Qualification',
    before:   '3 hrs / day',
    after:    'Real-time',
    gain:     'Continuous pipeline',
  },
  {
    process:  'Report Generation',
    before:   '4 hrs / cycle',
    after:    'On-demand',
    gain:     'Zero human overhead',
  },
  {
    process:  'Email Triage & Routing',
    before:   '90 min / day',
    after:    'Automated',
    gain:     '100% coverage',
  },
  {
    process:  'Competitive Intelligence',
    before:   '6 hrs / week',
    after:    'Daily digest',
    gain:     'Always current',
  },
];

export const EfficiencySection = () => {
  return (
    <section className="border-b border-grid" id="efficiency">
      {/* Header */}
      <div className="p-8 lg:p-16 border-b border-grid flex flex-col lg:flex-row justify-between items-end gap-8">
        <div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs text-signal tracking-widest uppercase mb-8 flex items-center gap-4"
          >
            <div className="w-2 h-2 bg-signal" />
            Efficiency Delta
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-5xl lg:text-6xl font-light tracking-tight"
          >
            Before vs.{' '}
            <span className="font-bold text-signal text-glow-signal">After.</span>
          </motion.h2>
        </div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-sm text-muted max-w-sm"
        >
          Representative benchmarks from deployed agentic workflow implementations across B2B operations functions.
        </motion.p>
      </div>

      {/* Comparison table */}
      <div className="px-8 lg:px-16 pb-16">
        {/* Column headers */}
        <div className="grid grid-cols-12 py-6 border-b border-grid text-[10px] text-muted uppercase tracking-widest">
          <div className="col-span-4">Process</div>
          <div className="col-span-3 text-center">Manual Operation</div>
          <div className="col-span-1" />
          <div className="col-span-3 text-center text-signal">Agentic Workflow</div>
          <div className="col-span-1 text-right">Delta</div>
        </div>

        {rows.map((row, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.5, ease: 'easeOut' }}
            className="grid grid-cols-12 py-6 border-b border-grid/60 items-center group hover:bg-surface/30 transition-colors duration-200 -mx-8 lg:-mx-16 px-8 lg:px-16"
          >
            {/* Process name */}
            <div className="col-span-4">
              <span className="text-sm font-semibold text-white">{row.process}</span>
            </div>

            {/* Before */}
            <div className="col-span-3 text-center">
              <span className="text-sm text-muted/70 font-mono line-through decoration-white/20">{row.before}</span>
            </div>

            {/* Arrow */}
            <div className="col-span-1 flex justify-center">
              <ArrowRight size={14} className="text-signal opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
            </div>

            {/* After */}
            <div className="col-span-3 text-center">
              <span className="text-sm font-bold text-signal font-mono">{row.after}</span>
            </div>

            {/* Gain */}
            <div className="col-span-1 text-right">
              <span className="text-[10px] text-signal/70 tracking-wide font-mono">{row.gain}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
