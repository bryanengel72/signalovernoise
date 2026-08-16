import { motion } from 'motion/react';
import { footerCopy, type FooterCopy } from '@/content/sections/footer';
import { EASE } from '../ui/Reveal';

interface FooterProps {
  onPrivacy: () => void;
  copy?: FooterCopy;
}

export const Footer = ({ onPrivacy, copy = footerCopy }: FooterProps) => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: EASE }}
      className="border-t border-white/5 p-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted uppercase tracking-widest">
      <div>{copy.copyright}</div>
      <div className="flex gap-8">
        {copy.links.map(({ label, href }) => (
          <a key={label} href={href} className="hover:text-signal transition-colors">{label}</a>
        ))}
        <button onClick={onPrivacy} className="hover:text-signal transition-colors cursor-pointer">{copy.privacyLabel}</button>
      </div>
    </motion.footer>
  );
};
