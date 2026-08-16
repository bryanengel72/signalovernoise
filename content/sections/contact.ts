import { identity } from '../identity.js';

export type ContactField = { label: string; placeholder: string };

export type ContactCopy = {
  eyebrow: string;
  headline: { lead: string; emphasis: string };
  intro: string;
  email: string;
  responseNote: string;
  bookingCta: string;
  booking: { slug: string; namespace: string; config: string };

  formTitle: string;
  fields: {
    name: ContactField;
    email: ContactField;
    company: ContactField;
    message: ContactField;
  };
  submitIdle: string;
  submitLoading: string;
  submitSuccess: string;

  /** Shown when VITE_TURNSTILE_SITE_KEY is absent, so the form cannot be submitted at all. */
  humanCheckUnconfigured: string;
};

export const contactCopy: ContactCopy = {
  eyebrow: 'Get in Touch',
  headline: { lead: "Let's", emphasis: 'Talk.' },
  intro:
    "Tell us what you're trying to solve and we'll tell you honestly whether AI can help — and what it would take.",
  email: identity.email,
  responseNote: 'Discovery calls within 48h',
  bookingCta: 'Schedule a Discovery Call',
  booking: identity.booking,

  formTitle: 'Send a Message',
  fields: {
    name: { label: 'Name', placeholder: 'Your name' },
    email: { label: 'Email', placeholder: 'your@email.com' },
    company: { label: 'Company', placeholder: 'Your company (optional)' },
    message: { label: 'What are you working on?', placeholder: 'Tell us what you need...' },
  },
  submitIdle: 'Send Message',
  submitLoading: 'Sending...',
  submitSuccess: 'Message Sent',

  humanCheckUnconfigured: `Human verification isn't configured (VITE_TURNSTILE_SITE_KEY is missing). Email ${identity.email} in the meantime.`,
};
