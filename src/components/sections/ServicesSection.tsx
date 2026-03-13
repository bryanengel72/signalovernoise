import { motion } from 'motion/react';

export const ServicesSection = () => {
  return (
    <section className="border-b border-grid" id="services">
      <div className="p-8 lg:p-16 border-b border-grid flex flex-col lg:flex-row justify-between items-end gap-8">
        <div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs text-signal tracking-widest uppercase mb-8 flex items-center gap-4"
          >
            <div className="w-2 h-2 bg-signal" />
            Capabilities
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-5xl lg:text-6xl font-light tracking-tight"
          >
            What We <span className="font-bold text-signal text-glow-signal">Build.</span>
          </motion.h2>
        </div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-sm text-muted max-w-md"
        >
          Every engagement is scoped for your specific context. We work across verticals including healthcare IT, veterinary, legal, media, and professional services.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-8 lg:px-16 pb-16">
        {[
          { num: "01", title: "Workflow Automation", desc: "Map manual processes, identify ROI targets, build workflows." },
          { num: "02", title: "Custom AI Agents", desc: "Purpose-built agents for specific jobs inside your business." },
          { num: "03", title: "Strategy & Roadmap", desc: "Clear, prioritized 90-day AI roadmap tailored to your team." },
          { num: "04", title: "Training & Handoff", desc: "Build your team's capability to maintain and expand." }
        ].map((svc, i) => (
          <motion.div
            key={i}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-8 border border-white/5 rounded-2xl glass mb-6 lg:mb-0 relative group overflow-hidden"
          >
            <div className="absolute inset-0 bg-signal translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out z-0" />
            <div className="relative z-10 group-hover:text-black transition-colors duration-500">
              <div className="font-display text-4xl font-bold text-grid group-hover:text-black/20 mb-12 transition-colors duration-500">{svc.num}</div>
              <h3 className="font-display text-xl font-bold uppercase mb-4">{svc.title}</h3>
              <p className="text-xs text-muted group-hover:text-black/70 transition-colors duration-500">{svc.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
