import { motion } from 'motion/react';
import { servicesCopy, type ServicesCopy } from '@/content/sections/services';
import { Reveal, reveal } from '../ui/Reveal';
import { SectionHeader } from '../ui/SectionHeader';

export const ServicesSection = ({ copy = servicesCopy }: { copy?: ServicesCopy }) => {
  return (
    <section className="border-b border-grid" id="services">
      <div className="p-8 lg:p-16 border-b border-grid flex flex-col lg:flex-row justify-between items-end gap-8">
        <div>
          <SectionHeader eyebrow={copy.eyebrow} headline={copy.headline} />
        </div>
        <motion.p {...reveal()} className="text-sm text-muted max-w-md">
          {copy.intro}
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-8 lg:px-16 pb-16">
        {copy.services.map((svc, i) => (
          <Reveal
            key={svc.num}
            delay={i * 0.1}
            className="p-8 border border-white/5 rounded-2xl glass mb-6 lg:mb-0 relative group overflow-hidden"
          >
            <div className="absolute inset-0 bg-signal translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out z-0" />
            <div className="relative z-10 group-hover:text-black transition-colors duration-500">
              <div className="font-display text-4xl font-bold text-grid group-hover:text-black/20 mb-12 transition-colors duration-500">{svc.num}</div>
              <h3 className="font-display text-xl font-bold uppercase mb-4">{svc.title}</h3>
              <p className="text-xs text-muted group-hover:text-black/70 transition-colors duration-500">{svc.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
};
