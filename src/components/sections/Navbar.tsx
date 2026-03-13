import { motion, useScroll, useTransform } from 'motion/react';

interface NavbarProps {
  scrollTo: (id: string) => void;
}

export const Navbar = ({ scrollTo }: NavbarProps) => {
  const { scrollY } = useScroll();

  // Border and background intensify slightly as user scrolls
  const bgOpacity = useTransform(scrollY, [0, 80], [0.1, 0.55]);
  const borderOpacity = useTransform(scrollY, [0, 80], [0.04, 0.12]);

  return (
    <motion.nav
      style={{
        backgroundColor: `rgba(11, 14, 20, var(--nav-bg, 0.1))`,
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.4)',
      }}
      className="fixed top-0 w-full z-40 px-6 lg:px-8 py-4 flex justify-between items-center border-b border-white/[0.06]"
    >
      {/* Subtle inner highlight at top edge */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

      {/* Logo */}
      <div className="flex items-center gap-3 font-display font-semibold text-lg lg:text-xl tracking-wide text-white">
        <div className="relative flex items-center justify-center w-4 h-4">
          <div className="absolute w-full h-full border border-signal rounded-full animate-ping opacity-40" />
          <div className="w-2 h-2 bg-signal rounded-full glow-signal" />
        </div>
        Signal Over Noise
      </div>

      {/* Nav links */}
      <div className="hidden md:flex items-center gap-8 text-xs tracking-widest uppercase text-muted">
        {[
          { label: 'Services', id: 'services' },
          { label: 'Process',  id: 'process'  },
          { label: 'About',    id: 'about'    },
        ].map(({ label, id }) => (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className="relative group hover:text-white transition-colors duration-200"
          >
            {label}
            <span className="absolute -bottom-0.5 left-0 w-0 group-hover:w-full h-[1px] bg-signal transition-all duration-300" />
          </button>
        ))}
      </div>

      {/* CTA pill — glass style */}
      <button
        onClick={() => scrollTo('contact')}
        className="relative px-5 lg:px-6 py-2 text-xs font-semibold rounded-full text-white overflow-hidden group border border-white/10 hover:border-signal/50 transition-colors duration-300"
        style={{
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Hover fill */}
        <span className="absolute inset-0 bg-signal/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
        <span className="relative z-10 group-hover:text-signal transition-colors duration-300">Initialize</span>
      </button>
    </motion.nav>
  );
};
