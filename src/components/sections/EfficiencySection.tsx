import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { efficiencyCopy, type EfficiencyCopy } from '@/content/sections/efficiency';
import { Reveal, reveal } from '../ui/Reveal';
import { SectionHeader } from '../ui/SectionHeader';

export const EfficiencySection = ({ copy = efficiencyCopy }: { copy?: EfficiencyCopy }) => {
  return (
    <section className="border-b border-grid" id="efficiency">
      {/* Header */}
      <div className="p-8 lg:p-16 border-b border-grid flex flex-col lg:flex-row justify-between items-end gap-8">
        <div>
          <SectionHeader eyebrow={copy.eyebrow} headline={copy.headline} />
        </div>
        <motion.p {...reveal()} className="text-sm text-muted max-w-sm">
          {copy.intro}
        </motion.p>
      </div>

      {/* Comparison table */}
      <div className="px-8 lg:px-16 pb-16">
        {/* Column headers */}
        <div className="grid grid-cols-12 py-6 border-b border-grid text-[10px] text-muted uppercase tracking-widest">
          <div className="col-span-4">{copy.columns.process}</div>
          <div className="col-span-3 text-center">{copy.columns.before}</div>
          <div className="col-span-1" />
          <div className="col-span-3 text-center text-signal">{copy.columns.after}</div>
          <div className="col-span-1 text-right">{copy.columns.gain}</div>
        </div>

        {copy.rows.map((row, i) => (
          <Reveal
            key={row.process}
            variant="slide"
            delay={i * 0.08}
            duration={0.5}
            className="grid grid-cols-12 py-6 border-b border-grid/60 items-center group hover:bg-surface/30 transition-colors duration-200 -mx-8 lg:-mx-16 px-8 lg:px-16"
          >
            {/* Process name */}
            <div className="col-span-4">
              <span className="text-sm font-semibold text-white">{row.process}</span>
            </div>

            {/* Before */}
            <div className="col-span-3 text-center">
              <span className="text-sm text-muted/70 tabular-nums line-through decoration-white/20">{row.before}</span>
            </div>

            {/* Arrow */}
            <div className="col-span-1 flex justify-center">
              <ArrowRight size={14} className="text-signal opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
            </div>

            {/* After */}
            <div className="col-span-3 text-center">
              <span className="text-sm font-bold text-signal tabular-nums">{row.after}</span>
            </div>

            {/* Gain */}
            <div className="col-span-1 text-right">
              <span className="text-[10px] text-signal/70 tracking-wide tabular-nums">{row.gain}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
};
