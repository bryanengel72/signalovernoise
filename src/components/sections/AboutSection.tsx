import { ChevronRight } from 'lucide-react';
import { aboutCopy, type AboutCopy } from '@/content/sections/about';
import { ICONS } from '../ui/icons';
import { Reveal } from '../ui/Reveal';
import { SectionHeader } from '../ui/SectionHeader';

export const AboutSection = ({ copy = aboutCopy }: { copy?: AboutCopy }) => {
  return (
    <section className="border-b border-grid" id="about">
      {/* Section header */}
      <div className="p-8 lg:p-16 border-b border-grid">
        <SectionHeader
          eyebrow={copy.eyebrow}
          headline={copy.headline}
          headlineClassName="max-w-3xl"
        />
      </div>

      {/* 3-pillar grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 border-b border-grid">
        {copy.pillars.map((pillar, i) => {
          const Icon = ICONS[pillar.icon];
          return (
            <Reveal
              key={pillar.title}
              delay={i * 0.12}
              duration={0.6}
              className={`p-8 lg:p-12 relative group ${i < copy.pillars.length - 1 ? 'border-b lg:border-b-0 lg:border-r border-grid' : ''}`}
            >
              {/* Top accent */}
              <div className="absolute top-0 left-8 lg:left-12 w-16 h-[2px] bg-signal opacity-60" />

              <div className="w-12 h-12 border border-signal/30 rounded-full flex items-center justify-center text-signal bg-signal/5 mb-8 group-hover:bg-signal/10 transition-colors duration-300">
                <Icon size={20} />
              </div>

              <div className="text-[10px] text-signal tracking-widest uppercase mb-3">{pillar.label}</div>
              <h3 className="font-display text-2xl font-bold text-white mb-4 tracking-tight">{pillar.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{pillar.desc}</p>
            </Reveal>
          );
        })}
      </div>

      {/* Credentials row */}
      <Reveal className="p-8 lg:p-16 bg-surface/40">
        <div className="text-[10px] text-muted tracking-widest uppercase mb-6">{copy.credentialsLabel}</div>
        <div className="flex flex-wrap gap-x-10 gap-y-3">
          {copy.credentials.map((cred) => (
            <div key={cred} className="flex items-center gap-2 text-xs text-muted">
              <ChevronRight size={12} className="text-signal flex-shrink-0" />
              <span>{cred}</span>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
};
