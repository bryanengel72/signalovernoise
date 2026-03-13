import { motion } from 'motion/react';
import { Mail, Calendar, ArrowRight } from 'lucide-react';

export const ContactSection = () => {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 border-b border-grid" id="contact">
      <div className="p-8 lg:p-16 border-b lg:border-b-0 lg:border-r border-grid">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs text-signal tracking-widest uppercase mb-12 flex items-center gap-4"
        >
          <div className="w-2 h-2 bg-signal" />
          Comm Link
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-5xl lg:text-6xl font-light tracking-tight mb-8"
        >
          Initiate <span className="font-bold text-signal text-glow-signal">Contact.</span>
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-sm text-muted mb-12 max-w-sm"
        >
          Tell us what you're trying to solve and we'll tell you honestly whether AI can help — and what it would take.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <div className="flex items-center gap-4 text-sm text-muted">
            <div className="w-10 h-10 border border-grid flex items-center justify-center text-signal bg-surface">
              <Mail size={16} />
            </div>
            bryan@signalovernoiseai.com
          </div>
          <div className="flex items-center gap-4 text-sm text-muted">
            <div className="w-10 h-10 border border-grid flex items-center justify-center text-signal bg-surface">
              <Calendar size={16} />
            </div>
            Discovery calls within 48h
          </div>
        </motion.div>
      </div>
      
      <div className="p-8 lg:p-16 bg-surface">
        <motion.form 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="border border-grid bg-bg flex flex-col" 
          onSubmit={(e) => {
            e.preventDefault();
            const btn = e.currentTarget.querySelector('button');
            if (btn) {
              btn.innerHTML = 'DATA TRANSMITTED <span class="ml-2">✓</span>';
              btn.classList.add('bg-white', 'text-black');
              btn.classList.remove('bg-signal', 'hover:bg-white');
            }
          }}
        >
          <div className="p-6 border-b border-grid bg-surface/50 backdrop-blur-sm">
            <span className="text-sm font-semibold text-white tracking-widest uppercase">Secure Comms Channel</span>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] text-signal uppercase tracking-widest">ID / Name</label>
              <input type="text" required className="w-full bg-transparent border-b border-grid pb-2 text-sm text-white focus:outline-none focus:border-signal transition-colors placeholder:text-muted/30" placeholder="Enter designation..." />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-signal uppercase tracking-widest">Comm / Email</label>
              <input type="email" required className="w-full bg-transparent border-b border-grid pb-2 text-sm text-white focus:outline-none focus:border-signal transition-colors placeholder:text-muted/30" placeholder="Enter routing address..." />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-signal uppercase tracking-widest">Org / Company</label>
              <input type="text" className="w-full bg-transparent border-b border-grid pb-2 text-sm text-white focus:outline-none focus:border-signal transition-colors placeholder:text-muted/30" placeholder="Enter affiliation..." />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-signal uppercase tracking-widest">Parameters / Challenge</label>
              <textarea rows={4} required className="w-full bg-transparent border-b border-grid pb-2 text-sm text-white focus:outline-none focus:border-signal transition-colors placeholder:text-muted/30 resize-none" placeholder="Define objective..." />
            </div>
          </div>
          <div className="p-6 bg-surface/30">
            <button type="submit" className="w-full p-4 bg-signal text-bg font-semibold text-sm rounded-full hover:glow-signal border border-signal transition-all flex justify-between items-center group">
              Transmit Data
              <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </motion.form>
      </div>
    </section>
  );
};
