import { motion } from 'motion/react';

export const Marquee = () => {
  return (
    <div className="flex overflow-hidden whitespace-nowrap bg-signal text-black py-3 border-b border-grid">
      <motion.div 
        className="flex gap-8 items-center text-xs font-bold tracking-widest uppercase min-w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      >
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex gap-8 items-center">
            <span>AUTOMATE OR STAGNATE</span>
            <span className="w-1.5 h-1.5 bg-black rounded-full" />
            <span>MEASURABLE ROI</span>
            <span className="w-1.5 h-1.5 bg-black rounded-full" />
            <span>CUT THROUGH THE NOISE</span>
            <span className="w-1.5 h-1.5 bg-black rounded-full" />
            <span>ZERO HYPE. RESULTS ONLY.</span>
            <span className="w-1.5 h-1.5 bg-black rounded-full" />
          </div>
        ))}
      </motion.div>
    </div>
  );
};
