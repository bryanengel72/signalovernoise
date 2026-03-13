import { useEffect, useState, useRef } from 'react';
import { motion, useInView, animate } from 'motion/react';
import { Activity, ChevronRight } from 'lucide-react';

const AnimatedCounter = ({ from, to, suffix = "", duration = 2 }: { from: number, to: number, suffix?: string, duration?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [current, setCurrent] = useState(from);
  
  useEffect(() => {
    if (isInView) {
      const controls = animate(from, to, {
        duration: duration,
        onUpdate(value) {
          setCurrent(Math.round(value));
        }
      });
      return () => controls.stop();
    }
  }, [from, to, duration, isInView]);

  return <span ref={ref}>{current}{suffix}</span>;
};

export const AboutSection = () => {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 border-b border-grid" id="about">
      <div className="p-8 lg:p-16 border-b lg:border-b-0 lg:border-r border-grid bg-surface/50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="border border-white/5 rounded-2xl p-6 relative bg-bg glass overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-signal to-transparent" />
          <div className="flex justify-between items-start mb-12">
            <div>
              <div className="text-[10px] text-muted tracking-widest uppercase mb-2">Personnel File</div>
              <h3 className="font-display text-3xl font-semibold text-white">Bryan Engel</h3>
              <div className="text-xs text-signal mt-1">Founder & Principal AI Consultant</div>
            </div>
            <div className="w-12 h-12 border border-signal/30 rounded-full flex items-center justify-center text-signal bg-signal/5">
              <Activity size={20} />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <div className="font-display text-2xl font-bold text-white"><AnimatedCounter from={0} to={20} /><span className="text-signal">+</span></div>
              <div className="text-[10px] text-muted uppercase tracking-wider">Years Exp</div>
            </div>
            <div>
              <div className="font-display text-2xl font-bold text-white"><AnimatedCounter from={0} to={100} /><span className="text-signal">+</span></div>
              <div className="text-[10px] text-muted uppercase tracking-wider">Agents Built</div>
            </div>
            <div>
              <div className="font-display text-2xl font-bold text-white">L<span className="text-signal">3</span></div>
              <div className="text-[10px] text-muted uppercase tracking-wider">AI Cert</div>
            </div>
            <div>
              <div className="font-display text-2xl font-bold text-white">Secret</div>
              <div className="text-[10px] text-muted uppercase tracking-wider">Clearance</div>
            </div>
          </div>
          
          <div className="space-y-3 border-t border-grid pt-6">
            {[
              "MindStudio Level 3 Certified",
              "PMP Certified Professional",
              "MBA + MS Innovation & Tech",
              "Former Program Manager at VA, DoD, USEUCOM, USAFRICOM, USNORTHCOM"
            ].map((cred, i) => (
              <div key={i} className="flex items-center gap-3 text-xs text-muted">
                <ChevronRight size={12} className="text-signal flex-shrink-0" />
                <span>{cred}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
      <div className="p-8 lg:p-16 flex flex-col justify-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-4xl lg:text-5xl font-light tracking-tight leading-tight mb-6"
        >
          Built by a <span className="font-semibold text-signal text-glow-signal">practitioner</span>,<br/>not a pundit.
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-sm text-muted leading-relaxed mb-6"
        >
          Signal Over Noise AI is led by Bryan Engel — a certified AI agent developer with two decades of Federal IT program management across VA, DoD, USEUCOM, USAFRICOM, and USNORTHCOM.
        </motion.p>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-sm text-muted leading-relaxed"
        >
          This is not a firm built on slide decks. Every engagement is run by someone who has built, shipped, and managed real systems at scale — and who now applies that discipline to practical AI implementation for businesses that need results, not more noise.
        </motion.p>
      </div>
    </section>
  );
};
