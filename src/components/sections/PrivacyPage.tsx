import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { privacyCopy, type PrivacyCopy } from '@/content/sections/privacy';

interface PrivacyPageProps {
  onClose: () => void;
  copy?: PrivacyCopy;
}

export const PrivacyPage = ({ onClose, copy = privacyCopy }: PrivacyPageProps) => {
  return (
    <motion.div
        key="privacy-overlay"
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        className="fixed inset-0 z-[200] bg-bg overflow-y-auto"
      >
        {/* Sticky header bar */}
        <div className="sticky top-0 z-10 backdrop-blur-xl bg-bg/80 border-b border-white/5 flex items-center justify-between px-8 py-5">
          <span className="text-xs text-signal tracking-widest uppercase font-semibold">{copy.eyebrow}</span>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-muted hover:text-white hover:border-white/30 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-8 py-16 text-sm text-muted leading-relaxed space-y-10">

          <div>
            <h1 className="font-display text-4xl font-light text-white tracking-tight mb-3">{copy.title}</h1>
            <p className="text-xs text-muted/60">{copy.lastUpdated}</p>
          </div>

          <p>
            {copy.preamble.lead}{' '}
            <span className="text-signal">{copy.preamble.domain}</span>{' '}
            {copy.preamble.trail}
          </p>

          {copy.sections.map((section) => (
            <div key={section.title}>
              <h2 className="font-display text-lg font-semibold text-white mb-3">{section.title}</h2>
              <p className="whitespace-pre-line">{section.body}</p>
            </div>
          ))}

          <div className="pt-8 border-t border-white/5 text-xs text-muted/50">
            {copy.footer}
          </div>
        </div>
    </motion.div>
  );
};
