import { useRef, useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { Mail, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { contactCopy, type ContactCopy } from '@/content/sections/contact';
import { clientMessages, inquiryProblemMessages } from '@/content/messages';
import {
  FIELD_LIMITS,
  cleanField,
  cleanInquiry,
  validateInquiry,
  type InquiryRequest,
} from '@/contact/inquiry';
import { Turnstile, type TurnstileHandle } from '../ui/Turnstile';
import { Reveal, reveal } from '../ui/Reveal';
import { SectionHeader } from '../ui/SectionHeader';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

export const ContactSection = ({ copy = contactCopy }: { copy?: ContactCopy }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [humanToken, setHumanToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileHandle>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!humanToken) {
      setErrorMessage(clientMessages.humanCheckIncomplete);
      return;
    }

    const form = e.currentTarget;
    const fields = Object.fromEntries(new FormData(form).entries());

    // Same rules the endpoint applies — checked here only to skip a pointless
    // round-trip. The server re-checks, because a client-side check is not a gate.
    const inquiry = cleanInquiry(fields);
    const problem = validateInquiry(inquiry);
    if (problem) {
      setErrorMessage(inquiryProblemMessages[problem]);
      return;
    }

    const request: InquiryRequest = {
      ...inquiry,
      website: cleanField(fields.website, FIELD_LIMITS.website), // honeypot — verified server-side
      turnstileToken: humanToken,
    };

    setStatus('loading');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(request),
      });

      const result = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? clientMessages.submitFailed);

      setStatus('success');
      form.reset();
    } catch (error) {
      console.error('Contact form error:', error);
      setStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : clientMessages.submitFailed,
      );
      // Turnstile tokens are single-use — clear the spent one and re-challenge.
      setHumanToken(null);
      turnstileRef.current?.reset();
    }
  };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 border-b border-grid" id="contact">
      <div className="p-8 lg:p-16 border-b lg:border-b-0 lg:border-r border-grid">
        <SectionHeader
          eyebrow={copy.eyebrow}
          headline={copy.headline}
          looseEyebrow
          headlineClassName="mb-8"
        />
        <motion.p {...reveal()} className="text-sm text-muted mb-12 max-w-sm">
          {copy.intro}
        </motion.p>

        <Reveal className="space-y-6">
          <div className="flex items-center gap-4 text-sm text-muted">
            <div className="w-10 h-10 border border-grid flex items-center justify-center text-signal bg-surface">
              <Mail size={16} />
            </div>
            {copy.email}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted">
            <div className="w-10 h-10 border border-grid flex items-center justify-center text-signal bg-surface">
              <Calendar size={16} />
            </div>
            {copy.responseNote}
          </div>

          <button
            data-cal-link={copy.booking.slug}
            data-cal-namespace={copy.booking.namespace}
            data-cal-config={copy.booking.config}
            className="mt-4 w-full sm:w-auto px-8 py-4 text-sm font-semibold bg-signal text-bg rounded-full hover:glow-signal border border-signal transition-all flex items-center gap-2 group"
          >
            <Calendar size={16} />
            {copy.bookingCta}
          </button>
        </Reveal>
      </div>

      <div className="p-8 lg:p-16 bg-surface">
        <motion.form
          {...reveal('scale')}
          className="border border-grid bg-bg flex flex-col"
          onSubmit={handleSubmit}
        >
          <div className="p-6 border-b border-grid bg-surface/50 backdrop-blur-sm">
            <span className="text-sm font-semibold text-white tracking-widest uppercase">{copy.formTitle}</span>
          </div>

          <div className="p-6 space-y-6">
            <input name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
            <div className="space-y-2">
              <label htmlFor="contact-name" className="text-[10px] text-signal uppercase tracking-widest">{copy.fields.name.label}</label>
              <input id="contact-name" name="name" type="text" required className="w-full bg-transparent border-b border-grid pb-2 text-sm text-white focus:outline-none focus:border-signal transition-colors placeholder:text-muted/30" placeholder={copy.fields.name.placeholder} />
            </div>
            <div className="space-y-2">
              <label htmlFor="contact-email" className="text-[10px] text-signal uppercase tracking-widest">{copy.fields.email.label}</label>
              <input id="contact-email" name="email" type="email" required className="w-full bg-transparent border-b border-grid pb-2 text-sm text-white focus:outline-none focus:border-signal transition-colors placeholder:text-muted/30" placeholder={copy.fields.email.placeholder} />
            </div>
            <div className="space-y-2">
              <label htmlFor="contact-company" className="text-[10px] text-signal uppercase tracking-widest">{copy.fields.company.label}</label>
              <input id="contact-company" name="company" type="text" className="w-full bg-transparent border-b border-grid pb-2 text-sm text-white focus:outline-none focus:border-signal transition-colors placeholder:text-muted/30" placeholder={copy.fields.company.placeholder} />
            </div>
            <div className="space-y-2">
              <label htmlFor="contact-message" className="text-[10px] text-signal uppercase tracking-widest">{copy.fields.message.label}</label>
              <textarea id="contact-message" name="message" rows={4} required className="w-full bg-transparent border-b border-grid pb-2 text-sm text-white focus:outline-none focus:border-signal transition-colors placeholder:text-muted/30 resize-none" placeholder={copy.fields.message.placeholder} />
            </div>
          </div>

          <div className="p-6 bg-surface/30 space-y-4">
            {status === 'success' ? (
              <div className="w-full p-4 bg-white text-black font-semibold text-sm rounded-full flex justify-between items-center">
                {copy.submitSuccess} <span>✓</span>
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
                    {copy.humanCheckUnconfigured}
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
                  {status === 'loading' ? copy.submitLoading : copy.submitIdle}
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
