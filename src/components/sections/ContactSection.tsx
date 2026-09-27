import { useEffect, useRef, useState, type FormEvent } from 'react';
import { m } from 'motion/react';
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
import { EVENTS, trackEvent } from '../../analytics';
import { Reveal, reveal } from '../ui/Reveal';
import { SectionHeader } from '../ui/SectionHeader';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

export const ContactSection = ({ copy = contactCopy }: { copy?: ContactCopy }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [humanToken, setHumanToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileHandle>(null);

  // The human check loads Cloudflare's script, so it waits until the form is
  // close to the screen (or a field takes focus) instead of loading with the
  // page for visitors who never scroll this far. Managed mode passes within
  // a second or two, well before anyone finishes typing.
  const formRef = useRef<HTMLFormElement>(null);
  const [checkWanted, setCheckWanted] = useState(false);

  useEffect(() => {
    if (checkWanted || !formRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setCheckWanted(true);
      },
      { rootMargin: '600px 0px' },
    );
    observer.observe(formRef.current);
    return () => observer.disconnect();
  }, [checkWanted]);

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
      trackEvent(EVENTS.inquirySent);
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
        <m.p {...reveal()} className="text-sm text-muted mb-12 max-w-sm">
          {copy.intro}
        </m.p>

        <Reveal className="space-y-6">
          <div className="flex items-center gap-4 text-sm text-muted">
            <div className="w-10 h-10 border border-grid flex items-center justify-center text-signal bg-surface">
              <Mail size={16} />
            </div>
            <a href={`mailto:${copy.email}`} className="hover:text-signal transition-colors">
              {copy.email}
            </a>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted">
            <div className="w-10 h-10 border border-grid flex items-center justify-center text-signal bg-surface">
              <Calendar size={16} />
            </div>
            {copy.responseNote}
          </div>

          <button
            data-cal-link={copy.booking.slug}
            data-track-cta="contact-book"
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
        <m.form
          {...reveal('scale')}
          ref={formRef}
          className="border border-grid bg-bg flex flex-col"
          onSubmit={handleSubmit}
          onFocus={() => setCheckWanted(true)}
        >
          <div className="p-6 border-b border-grid bg-surface/50 backdrop-blur-sm">
            <span className="text-sm font-semibold text-white tracking-widest uppercase">{copy.formTitle}</span>
          </div>

          <div className="p-6 space-y-6">
            <input name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
            <div className="space-y-2">
              <label htmlFor="contact-name" className="text-xs text-signal uppercase tracking-widest">{copy.fields.name.label}</label>
              <input id="contact-name" name="name" type="text" required autoComplete="name" maxLength={FIELD_LIMITS.name} className="w-full bg-transparent border-b border-grid pb-2 text-sm text-white focus:outline-none focus:border-signal transition-colors placeholder:text-muted/75" placeholder={copy.fields.name.placeholder} />
            </div>
            <div className="space-y-2">
              <label htmlFor="contact-email" className="text-xs text-signal uppercase tracking-widest">{copy.fields.email.label}</label>
              <input id="contact-email" name="email" type="email" required autoComplete="email" maxLength={FIELD_LIMITS.email} className="w-full bg-transparent border-b border-grid pb-2 text-sm text-white focus:outline-none focus:border-signal transition-colors placeholder:text-muted/75" placeholder={copy.fields.email.placeholder} />
            </div>
            <div className="space-y-2">
              <label htmlFor="contact-company" className="text-xs text-signal uppercase tracking-widest">{copy.fields.company.label}</label>
              <input id="contact-company" name="company" type="text" autoComplete="organization" maxLength={FIELD_LIMITS.company} className="w-full bg-transparent border-b border-grid pb-2 text-sm text-white focus:outline-none focus:border-signal transition-colors placeholder:text-muted/75" placeholder={copy.fields.company.placeholder} />
            </div>
            <div className="space-y-2">
              <label htmlFor="contact-message" className="text-xs text-signal uppercase tracking-widest">{copy.fields.message.label}</label>
              <textarea id="contact-message" name="message" rows={4} required maxLength={FIELD_LIMITS.message} className="w-full bg-transparent border-b border-grid pb-2 text-sm text-white focus:outline-none focus:border-signal transition-colors placeholder:text-muted/75 resize-none" placeholder={copy.fields.message.placeholder} />
            </div>
          </div>

          <div className="p-6 bg-surface/30 space-y-4">
            {status === 'success' ? (
              <div className="w-full p-4 bg-white text-black font-semibold text-sm rounded-full flex justify-between items-center">
                {copy.submitSuccess} <span>✓</span>
              </div>
            ) : (
              <>
                {TURNSTILE_SITE_KEY && !checkWanted ? (
                  // Holds the widget's height so the form does not jump when it mounts.
                  <div className="min-h-[65px]" />
                ) : TURNSTILE_SITE_KEY ? (
                  <Turnstile
                    ref={turnstileRef}
                    siteKey={TURNSTILE_SITE_KEY}
                    onToken={(token) => {
                      setHumanToken(token);
                      // A fresh token only answers the "complete the human check"
                      // prompt. A failed send resets the widget, which re-passes
                      // within a second — clearing every error here wiped the
                      // failure message before anyone could read it.
                      if (token) {
                        setErrorMessage((current) =>
                          current === clientMessages.humanCheckIncomplete ? null : current,
                        );
                      }
                    }}
                    onError={setErrorMessage}
                  />
                ) : (
                  <p className="text-xs text-red-400 leading-relaxed">
                    {copy.humanCheckUnconfigured}
                  </p>
                )}

                {errorMessage && (
                  <p role="alert" className="text-xs text-red-400 leading-relaxed">
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
        </m.form>
      </div>
    </section>
  );
};
