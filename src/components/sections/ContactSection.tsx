import { useRef, useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { Mail, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { Turnstile, type TurnstileHandle } from '../ui/Turnstile';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

export const ContactSection = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [humanToken, setHumanToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileHandle>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!humanToken) {
      setErrorMessage('Please complete the human check below.');
      return;
    }

    const form = e.currentTarget;
    const fields = new FormData(form);

    setStatus('loading');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: fields.get('name'),
          email: fields.get('email'),
          company: fields.get('company'),
          message: fields.get('message'),
          website: fields.get('website'), // honeypot — verified server-side
          turnstileToken: humanToken,
        }),
      });

      const result = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? 'Transmission failed — try again.');

      setStatus('success');
      form.reset();
    } catch (error) {
      console.error('Contact form error:', error);
      setStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Transmission failed — try again.',
      );
      // Turnstile tokens are single-use — clear the spent one and re-challenge.
      setHumanToken(null);
      turnstileRef.current?.reset();
    }
  };

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
          Get in Touch
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-5xl lg:text-6xl font-light tracking-tight mb-8"
        >
          Let's <span className="font-bold text-signal text-glow-signal">Talk.</span>
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

          <button
            data-cal-link="bryan-engel-amlxcu/30min"
            data-cal-namespace="30min"
            data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
            className="mt-4 w-full sm:w-auto px-8 py-4 text-sm font-semibold bg-signal text-bg rounded-full hover:glow-signal border border-signal transition-all flex items-center gap-2 group"
          >
            <Calendar size={16} />
            Schedule a Discovery Call
          </button>
        </motion.div>
      </div>
      
      <div className="p-8 lg:p-16 bg-surface">
        <motion.form 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="border border-grid bg-bg flex flex-col"
          onSubmit={handleSubmit}
        >
          <div className="p-6 border-b border-grid bg-surface/50 backdrop-blur-sm">
            <span className="text-sm font-semibold text-white tracking-widest uppercase">Send a Message</span>
          </div>
          
          <div className="p-6 space-y-6">
            <input name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
            <div className="space-y-2">
              <label htmlFor="contact-name" className="text-[10px] text-signal uppercase tracking-widest">Name</label>
              <input id="contact-name" name="name" type="text" required className="w-full bg-transparent border-b border-grid pb-2 text-sm text-white focus:outline-none focus:border-signal transition-colors placeholder:text-muted/30" placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <label htmlFor="contact-email" className="text-[10px] text-signal uppercase tracking-widest">Email</label>
              <input id="contact-email" name="email" type="email" required className="w-full bg-transparent border-b border-grid pb-2 text-sm text-white focus:outline-none focus:border-signal transition-colors placeholder:text-muted/30" placeholder="your@email.com" />
            </div>
            <div className="space-y-2">
              <label htmlFor="contact-company" className="text-[10px] text-signal uppercase tracking-widest">Company</label>
              <input id="contact-company" name="company" type="text" className="w-full bg-transparent border-b border-grid pb-2 text-sm text-white focus:outline-none focus:border-signal transition-colors placeholder:text-muted/30" placeholder="Your company (optional)" />
            </div>
            <div className="space-y-2">
              <label htmlFor="contact-message" className="text-[10px] text-signal uppercase tracking-widest">What are you working on?</label>
              <textarea id="contact-message" name="message" rows={4} required className="w-full bg-transparent border-b border-grid pb-2 text-sm text-white focus:outline-none focus:border-signal transition-colors placeholder:text-muted/30 resize-none" placeholder="Tell us what you need..." />
            </div>
          </div>

          <div className="p-6 bg-surface/30 space-y-4">
            {status === 'success' ? (
              <div className="w-full p-4 bg-white text-black font-semibold text-sm rounded-full flex justify-between items-center">
                Message Sent <span>✓</span>
              </div>
            ) : (
              <>
                {TURNSTILE_SITE_KEY ? (
                  <Turnstile
                    ref={turnstileRef}
                    siteKey={TURNSTILE_SITE_KEY}
                    onToken={(token) => {
                      setHumanToken(token);
                      if (token) setErrorMessage(null);
                    }}
                    onError={setErrorMessage}
                  />
                ) : (
                  <p className="text-[11px] text-red-400 leading-relaxed">
                    Human verification isn't configured (<code>VITE_TURNSTILE_SITE_KEY</code> is
                    missing). Email bryan@signalovernoiseai.com in the meantime.
                  </p>
                )}

                {errorMessage && (
                  <p role="alert" className="text-[11px] text-red-400 leading-relaxed">
                    {errorMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading' || !humanToken}
                  className="w-full p-4 bg-signal text-bg font-semibold text-sm rounded-full hover:glow-signal border border-signal transition-all flex justify-between items-center group disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? 'Sending...' : 'Send Message'}
                  {status === 'loading'
                    ? <Loader2 size={16} className="animate-spin" />
                    : <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                  }
                </button>
              </>
            )}
          </div>
        </motion.form>
      </div>
    </section>
  );
};
