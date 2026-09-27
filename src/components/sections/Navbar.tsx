import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { navCopy, type NavCopy } from '@/content/sections/nav';
import { EASE } from '../ui/Reveal';

interface NavbarProps {
  copy?: NavCopy;
}

export const Navbar = ({ copy = navCopy }: NavbarProps) => {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  // Below md the inline links are hidden, so phones get them from a menu.
  const [menuOpen, setMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    // Hide when scrolling down past the hero chrome, reveal on any upward scroll
    setHidden(latest > prev && latest > 160);
  });

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      // An open menu keeps the bar in place; it would otherwise slide away mid-tap.
      animate={{ y: hidden && !menuOpen ? '-100%' : 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: EASE }}
      style={{
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.4)',
      }}
      className="fixed top-0 w-full z-40 h-nav px-4 sm:px-6 lg:px-8 flex justify-between items-center border-b border-white/[0.06] bg-bg/10"
    >
      {/* Subtle inner highlight at top edge */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

      {/* Logo */}
      <div className="flex items-center gap-2.5 sm:gap-3 font-display font-semibold text-base sm:text-lg lg:text-xl tracking-wide text-white whitespace-nowrap">
        <div className="relative flex items-center justify-center w-4 h-4">
          <div className="absolute w-full h-full border border-signal rounded-full animate-ping opacity-40" />
          <div className="w-2 h-2 bg-signal rounded-full glow-signal" />
        </div>
        {copy.wordmark}
      </div>

      {/* Nav links */}
      <div className="hidden md:flex items-center gap-8 text-xs tracking-widest uppercase text-muted">
        {copy.links.map(({ label, id }) => (
          <a
            key={id}
            href={`#${id}`}
            className="relative group hover:text-white transition-colors duration-200"
          >
            {label}
            <span className="absolute -bottom-0.5 left-0 w-0 group-hover:w-full h-[1px] bg-signal transition-all duration-300" />
          </a>
        ))}

        {/* Cinematic scroll-film — full-page experience */}
        <a
          href={copy.experience.href}
          className="relative group flex items-center gap-2 text-signal/80 hover:text-signal transition-colors duration-200"
        >
          <span className="relative flex w-1.5 h-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-signal opacity-60 animate-ping" />
            <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-signal" />
          </span>
          {copy.experience.label}
          <span className="absolute -bottom-0.5 left-0 w-0 group-hover:w-full h-[1px] bg-signal transition-all duration-300" />
        </a>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* CTA pill — glass style */}
        <a
          href="#contact"
          onClick={closeMenu}
          className="relative inline-block px-4 sm:px-5 lg:px-6 py-2 text-xs whitespace-nowrap font-semibold rounded-full text-white overflow-hidden group border border-white/10 hover:border-signal/50 transition-colors duration-300"
          style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Hover fill */}
          <span className="absolute inset-0 bg-signal/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
          <span className="relative z-10 group-hover:text-signal transition-colors duration-300">{copy.cta}</span>
        </a>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-full border border-white/10 text-white hover:border-signal/50 transition-colors duration-300"
        >
          {menuOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="md:hidden absolute top-full left-0 right-0 bg-bg/95 backdrop-blur-xl border-b border-white/[0.06] px-4 sm:px-6 py-4 flex flex-col text-sm tracking-widest uppercase text-muted"
          >
            {copy.links.map(({ label, id }) => (
              <a key={id} href={`#${id}`} onClick={closeMenu} className="py-3 hover:text-white transition-colors">
                {label}
              </a>
            ))}
            <a href={copy.experience.href} onClick={closeMenu} className="py-3 text-signal/80 hover:text-signal transition-colors">
              {copy.experience.label}
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
