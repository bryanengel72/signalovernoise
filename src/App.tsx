import { useState } from 'react';
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m, useScroll, useSpring } from 'motion/react';
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
import { PrivacyPage } from './components/sections/PrivacyPage';

export default function App() {
  // The privacy policy is a modal with no route of its own, so it was
  // unreachable from anywhere outside this page — the scroll-film had no way to
  // link to it at all. `/?privacy=1` opens it directly.
  const [showPrivacy, setShowPrivacy] = useState(
    () => new URLSearchParams(window.location.search).has('privacy'),
  );

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
      
      <Navbar />

      <main className="pt-nav">
        <HeroSection />
        <Marquee />
        <ProblemSection />
        <ServicesSection />
        <EfficiencySection />
        <ProcessSection />
        <AboutSection />
        <ContactSection />
      </main>
      
      <Footer onPrivacy={() => setShowPrivacy(true)} />

      <AnimatePresence>
        {showPrivacy && <PrivacyPage onClose={() => setShowPrivacy(false)} />}
      </AnimatePresence>
    </div>
    </LazyMotion>
    </MotionConfig>
  );
}
