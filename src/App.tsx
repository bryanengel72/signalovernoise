import { useState } from 'react';
import { Marquee } from './components/ui/Marquee';
import { Navbar } from './components/sections/Navbar';
import { HeroSection } from './components/sections/HeroSection';
import { ProblemSection } from './components/sections/ProblemSection';
import { ServicesSection } from './components/sections/ServicesSection';
import { ProcessSection } from './components/sections/ProcessSection';
import { AboutSection } from './components/sections/AboutSection';
import { ContactSection } from './components/sections/ContactSection';
import { Footer } from './components/sections/Footer';
import { PrivacyPage } from './components/sections/PrivacyPage';

export default function App() {
  const [showPrivacy, setShowPrivacy] = useState(false);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text font-mono selection:bg-signal selection:text-black">
      <div className="noise-bg opacity-[0.03]" />
      
      <Navbar scrollTo={scrollTo} />

      <main className="pt-[73px]">
        <HeroSection scrollTo={scrollTo} />
        <Marquee />
        <ProblemSection />
        <ServicesSection />
        <ProcessSection />
        <AboutSection />
        <ContactSection />
      </main>
      
      <Footer onPrivacy={() => setShowPrivacy(true)} />

      {showPrivacy && <PrivacyPage onClose={() => setShowPrivacy(false)} />}
    </div>
  );
}
