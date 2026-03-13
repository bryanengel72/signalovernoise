import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Activity, Cpu, Database, Terminal } from 'lucide-react';
import { useRef } from 'react';

const problems = [
  { icon: Activity,  title: "Unstructured Data Overhead",       desc: "Disparate data sources consume analyst bandwidth without producing actionable output.",  color: "#00E5FF" },
  { icon: Database,  title: "Process Inefficiency",             desc: "Repetitive manual workflows consume capacity that should be allocated to high-leverage tasks.", color: "#00E5FF" },
  { icon: Terminal,  title: "Deployment Failure Rate",          desc: "Pilot-stage AI tools fail to reach production due to poor systems integration and no deployment framework.", color: "#00E5FF" },
  { icon: Cpu,       title: "No Implementation Framework",      desc: "No prioritized roadmap means AI investment is scattered. No sequencing. No measurable ROI targets.", color: "#00E5FF" },
];

function TiltCard({ item, index }: { item: typeof problems[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 20 });
  const springY = useSpring(y, { stiffness: 200, damping: 20 });
  const rotateX = useTransform(springY, [-50, 50], [8, -8]);
  const rotateY = useTransform(springX, [-50, 50], [-8, 8]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };

  const Icon = item.icon;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.12, duration: 0.6, ease: 'easeOut' }}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 800 }}
      className="p-8 border border-white/5 rounded-2xl glass hover:border-signal/30 transition-colors duration-300 relative group overflow-hidden cursor-default"
    >
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 30%, rgba(0,229,255,0.07) 0%, transparent 70%)' }}
      />
      <motion.div
        className="absolute top-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-signal to-transparent w-full opacity-0 group-hover:opacity-100"
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.4 }}
      />
      <div className="relative w-12 h-12 mb-6">
        <motion.div
          className="absolute inset-0 rounded-full border border-signal/30 opacity-0 group-hover:opacity-100"
          animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: index * 0.3 }}
        />
        <motion.div
          className="w-12 h-12 rounded-full bg-signal/10 flex items-center justify-center text-signal border border-signal/20 group-hover:bg-signal/20 group-hover:border-signal/50 transition-colors duration-300"
          whileHover={{ rotate: [0, -8, 8, 0] }}
          transition={{ duration: 0.4 }}
        >
          <Icon size={18} />
        </motion.div>
      </div>
      <motion.h3 className="font-display text-xl font-bold mb-3 text-white group-hover:text-signal transition-colors duration-300">
        {item.title}
      </motion.h3>
      <p className="text-xs text-muted leading-relaxed group-hover:text-text/60 transition-colors duration-300">
        {item.desc}
      </p>
      <motion.div
        className="absolute bottom-4 right-4 w-1.5 h-1.5 rounded-full bg-signal opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        animate={{ scale: [1, 1.4, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: index * 0.4 }}
      />
    </motion.div>
  );
}

export const ProblemSection = () => {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 border-b border-grid">
      <div className="lg:col-span-5 p-8 lg:p-16 border-b lg:border-b-0 lg:border-r border-grid">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs text-signal tracking-widest uppercase mb-12 flex items-center gap-4"
        >
          <div className="w-2 h-2 bg-signal" />
          Diagnostic
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-4xl lg:text-5xl font-light tracking-tight leading-tight mb-6"
        >
          The Cost of Operating{' '}
          <span className="font-semibold text-signal text-glow-signal">Without an AI Framework.</span>
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="text-sm text-muted leading-relaxed"
        >
          Most B2B organizations are running AI as an experiment, not an infrastructure decision. The result: compounding inefficiency, failed deployments, and zero ROI attribution.
        </motion.p>
      </div>
      <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 p-8 lg:p-16" style={{ perspective: '1000px' }}>
        {problems.map((item, i) => (
          <TiltCard key={i} item={item} index={i} />
        ))}
      </div>
    </section>
  );
};
