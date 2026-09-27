import { m } from 'motion/react';
import { footerCopy, type FooterCopy } from '@/content/sections/footer';
import { reveal } from '../ui/Reveal';

interface FooterProps {
  copy?: FooterCopy;
}

export const Footer = ({ copy = footerCopy }: FooterProps) => {
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
        {/* A real page, not a modal: it has a URL, search engines can read it,
            and the scroll-film links to it like any other page. */}
        <a href="/privacy" className="hover:text-signal transition-colors">{copy.privacyLabel}</a>
      </div>
    </m.footer>
  );
};
