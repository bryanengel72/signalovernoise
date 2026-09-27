import { track } from '@vercel/analytics';

/**
 * Visit and conversion measurement: Vercel Web Analytics (cookie-free page
 * views and events) and Speed Insights (real visitors' Core Web Vitals).
 *
 * Both scripts load from this site's own /_vercel/ paths, so the CSP needs no
 * new origins. Event names are declared here once, so a dashboard filter and
 * the code that fires it cannot drift apart.
 */

export const EVENTS = {
  /** A "Get Started" / audit CTA that scrolls to the contact section. */
  ctaClick: 'CTA Click',
  /** The Cal.com booking modal was asked for. */
  bookingOpened: 'Booking Opened',
  /** Cal.com reported a booking made. */
  bookingCompleted: 'Booking Completed',
  /** The contact form was delivered to the inbox. */
  inquirySent: 'Inquiry Sent',
} as const;

type EventName = (typeof EVENTS)[keyof typeof EVENTS];

export const trackEvent = (name: EventName, properties?: Record<string, string>) => {
  track(name, properties);
};

/**
 * Reports clicks on anything marked `data-track-cta="<label>"` — the markup
 * names the CTA, this counts it.
 */
export const installAnalytics = (doc: Document = document) => {
  doc.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-track-cta]') : null;
    if (target) trackEvent(EVENTS.ctaClick, { cta: target.dataset.trackCta! });
  });
};
