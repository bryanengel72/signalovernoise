import { motion } from 'motion/react';

const phases = [
  { step: "01", title: "Discover", desc: "Map current workflows, identify friction points, surface high-leverage automation opportunities.", tag: "30-60 MIN SCAN" },
  { step: "02", title: "Design", desc: "Architect the solution. Scope exactly what to build, tools to use, and integration points.", tag: "1-2 WEEK SPRINT" },
  { step: "03", title: "Deploy", desc: "Build, test, and deploy in your environment. Leave with working automation and training.", tag: "LIVE SYSTEM" }
];

export const ProcessSection = () => {
  return (
    <section className="border-b border-grid" id="process">
      <div className="p-8 lg:p-16 border-b border-grid">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs text-signal tracking-widest uppercase mb-8 flex items-center gap-4"
        >
          <div className="w-2 h-2 bg-signal rounded-full" />
          Execution Protocol
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-5xl lg:text-6xl font-light tracking-tight"
        >
          How It <span className="font-bold text-signal text-glow-signal">Works.</span>
        </motion.h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 lg:p-16">
        {phases.map((phase, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15, duration: 0.6, ease: "easeOut" }}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
            className="p-8 lg:p-12 border border-white/5 rounded-2xl glass relative group cursor-default overflow-hidden"
          >
            {/* Animated glow border on hover */}
            <motion.div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: 'linear-gradient(135deg, rgba(0,229,255,0.08) 0%, transparent 60%)',
                boxShadow: 'inset 0 0 40px -20px var(--color-signal)'
              }}
            />

            {/* Top accent line that grows on hover */}
            <div className="absolute top-0 left-0 h-[2px] w-0 group-hover:w-full bg-gradient-to-r from-signal/80 to-transparent transition-all duration-500 ease-out rounded-full" />

            {/* Step number — highlights on hover */}
            <motion.div
              className="font-display text-7xl font-bold mb-8 transition-colors duration-300 text-white/5 group-hover:text-signal/20"
            >
              {phase.step}
            </motion.div>

            <h3 className="font-display text-2xl font-bold uppercase text-white mb-4 group-hover:text-signal transition-colors duration-300">
              {phase.title}
            </h3>
            <p className="text-sm text-muted mb-8 leading-relaxed group-hover:text-text/70 transition-colors duration-300">
              {phase.desc}
            </p>

            {/* Tag — glows and expands on hover */}
            <motion.div
              className="inline-flex items-center gap-2 bg-signal/10 text-signal text-[10px] font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full group-hover:bg-signal/20 group-hover:glow-signal transition-all duration-300"
            >
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-signal"
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
              />
              {phase.tag}
            </motion.div>

            {/* Connector arrow between cards */}
            {i < 2 && (
              <motion.div
                className="hidden md:flex absolute top-1/2 -right-6 -translate-y-1/2 items-center gap-1 z-10"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: i * 0.15 + 0.4 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className="h-[1px] bg-gradient-to-r from-signal/60 to-signal/20"
                  initial={{ width: 0 }}
                  whileInView={{ width: 16 }}
                  transition={{ delay: i * 0.15 + 0.5, duration: 0.4 }}
                  viewport={{ once: true }}
                />
                <div className="w-1.5 h-1.5 border-t border-r border-signal/60 rotate-45 -ml-1" />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
};
