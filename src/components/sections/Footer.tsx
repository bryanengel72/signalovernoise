import { m } from 'motion/react';
import { footerCopy, type FooterCopy } from '@/content/sections/footer';
import { reveal } from '../ui/Reveal';

interface FooterProps {
  onPrivacy: () => void;
  copy?: FooterCopy;
}

export const Footer = ({ onPrivacy, copy = footerCopy }: FooterProps) => {
  return (
    <m.footer
      {...reveal()}
      className="border-t border-white/5 p-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted uppercase tracking-widest">
      <div>{copy.copyright}</div>
      <div className="flex gap-8">
        {copy.links.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            // Off-site links open in a new tab; on-site ones navigate in place.
            {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="hover:text-signal transition-colors"
          >
            {label}
          </a>
        ))}
        <button onClick={onPrivacy} className="hover:text-signal transition-colors cursor-pointer">{copy.privacyLabel}</button>
      </div>
    </m.footer>
  );
};
