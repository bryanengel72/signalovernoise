import { motion } from 'motion/react';
import { EASE } from '../ui/Reveal';

interface FooterProps {
  onPrivacy: () => void;
}

export const Footer = ({ onPrivacy }: FooterProps) => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: EASE }}
      className="border-t border-white/5 p-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted uppercase tracking-widest">
      <div>© 2026 SIGNAL OVER NOISE AI.</div>
      <div className="flex gap-8">
        <a href="#" className="hover:text-signal transition-colors">Blog</a>
        <button onClick={onPrivacy} className="hover:text-signal transition-colors cursor-pointer">Privacy Policy</button>
      </div>
    </motion.footer>
  );
};
