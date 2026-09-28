import { useEffect } from 'react';
import { LazyMotion, MotionConfig, domAnimation, m, useScroll, useSpring } from 'motion/react';
import { Marquee } from './components/ui/Marquee';
import { Navbar } from './components/sections/Navbar';
import { HeroSection } from './components/sections/HeroSection';
import { ProblemSection } from './components/sections/ProblemSection';
import { ServicesSection } from './components/sections/ServicesSection';
import { EfficiencySection } from './components/sections/EfficiencySection';
import { ProcessSection } from './components/sections/ProcessSection';
import { AboutSection } from './components/sections/AboutSection';
import { ContactSection } from './components/sections/ContactSection';
import { Footer } from './components/sections/Footer';
import { installRevealOnScroll } from './revealOnScroll';

export default function App() {
  // Runs in the browser only, after hydration: the pre-rendered page stays
  // fully visible, and just the below-the-fold Sections are set up to reveal.
  useEffect(() => installRevealOnScroll(), []);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });

  return (
    <MotionConfig reducedMotion="user">
    {/* Components render as `m.*` and take their animation features from here:
        domAnimation covers everything the page uses (enter/exit, hover, tap,
        in-view) and leaves out drag and layout animation, which it does not.
        `strict` fails loudly if a full `motion.*` component sneaks back in. */}
    <LazyMotion features={domAnimation} strict>
    <div className="min-h-screen bg-bg text-text font-body selection:bg-signal selection:text-black">
      <div className="noise-bg" />

      {/* Scroll progress indicator */}
      <m.div
        style={{ scaleX: progress }}
        className="fixed top-0 left-0 right-0 h-[2px] bg-signal origin-left z-[60] glow-signal"
      />
      
      {/* First in the tab order, visible only when focused: keyboard and
          screen-reader visitors can jump past the navigation. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:px-4 focus:py-2 focus:rounded-full focus:bg-signal focus:text-black focus:text-sm focus:font-semibold"
      >
        Skip to content
      </a>

      <Navbar />

      <main id="main" tabIndex={-1} className="pt-nav outline-none">
        <HeroSection />
        <Marquee />
        <ProblemSection />
        <ServicesSection />
        <EfficiencySection />
        <ProcessSection />
        <AboutSection />
        <ContactSection />
      </main>
      
      <Footer />
    </div>
    </LazyMotion>
    </MotionConfig>
  );
}
