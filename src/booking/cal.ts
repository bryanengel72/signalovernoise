import { identity } from '@/content/identity';

/**
 * Cal.com's element-click embed, loaded on intent instead of on every visit.
 *
 * Both pages used to paste Cal's snippet into <head>, and it called
 * Cal("init") straight away — which downloads ~90KB of embed.js for every
 * visitor, though few of them book. Now nothing is fetched until someone
 * points at, touches or tabs to a booking button.
 *
 * The one race that matters: a click that lands before embed.js has finished
 * loading. Cal's own click listener is not attached yet, so this module
 * catches that click and queues the modal through Cal's command stub, which
 * replays it the moment the embed is ready.
 */

const EMBED_SRC = 'https://app.cal.com/embed/embed.js';
const ORIGIN = 'https://app.cal.com';
const TRIGGER = '[data-cal-link]';

type CalApi = ((...args: unknown[]) => void) & {
  q?: unknown[][];
  ns?: Record<string, CalApi>;
  loaded?: boolean;
};

declare global {
  interface Window {
    Cal?: CalApi;
  }
}

/**
 * Cal's official stub, unminified: it queues every command, and on the first
 * one appends embed.js, which drains the queue once it loads.
 */
const installStub = (win: Window, doc: Document) => {
  if (win.Cal) return;
  const push = (api: CalApi, args: unknown[]) => api.q!.push(args);

  const cal: CalApi = function (...args: unknown[]) {
    if (!cal.loaded) {
      cal.ns = {};
      cal.q = cal.q || [];
      doc.head.appendChild(doc.createElement('script')).src = EMBED_SRC;
      cal.loaded = true;
    }
    if (args[0] === 'init') {
      const api: CalApi = function (...inner: unknown[]) {
        push(api, inner);
      };
      api.q = api.q || [];
      const namespace = args[1];
      if (typeof namespace === 'string') {
        cal.ns![namespace] = cal.ns![namespace] || api;
        push(cal.ns![namespace], args);
        push(cal, ['initNamespace', namespace]);
      } else {
        push(cal, args);
      }
      return;
    }
    push(cal, args);
  } as CalApi;

  win.Cal = cal;
};

type LazyCalOptions = {
  /** A booking button was pressed; `source` is its `data-track-cta` label, or the page path. */
  onOpen?: (source: string) => void;
  /** Cal reported a completed booking. */
  onBooked?: () => void;
  win?: Window;
  doc?: Document;
};

export const installLazyCal = ({
  onOpen,
  onBooked,
  win = window,
  doc = document,
}: LazyCalOptions = {}) => {
  const { namespace } = identity.booking;
  let requested = false;
  let ready = false;

  const load = () => {
    if (requested) return;
    requested = true;
    installStub(win, doc);
    win.Cal!('init', namespace, { origin: ORIGIN });
    win.Cal!.ns![namespace]('ui', { hideEventTypeDetails: false, layout: 'month_view' });
    if (onBooked) win.Cal!.ns![namespace]('on', { action: 'bookingSuccessful', callback: onBooked });
    doc
      .querySelector<HTMLScriptElement>(`script[src="${EMBED_SRC}"]`)
      ?.addEventListener('load', () => {
        ready = true;
      });
  };

  const trigger = (event: Event) =>
    event.target instanceof Element ? event.target.closest<HTMLElement>(TRIGGER) : null;

  const onIntent = (event: Event) => {
    if (trigger(event)) load();
  };

  const onClick = (event: MouseEvent) => {
    const button = trigger(event);
    if (!button) return;
    onOpen?.(button.dataset.trackCta || win.location.pathname);
    if (ready) return; // once ready, Cal's own listener opens the modal
    load();
    event.preventDefault();

    let config: Record<string, unknown> = {};
    try {
      config = JSON.parse(button.dataset.calConfig || '{}');
    } catch {
      // A malformed config should not cost the visitor the booking.
    }
    win.Cal!.ns![button.dataset.calNamespace || namespace]('modal', {
      calLink: button.dataset.calLink,
      config,
    });
  };

  doc.addEventListener('pointerover', onIntent, { passive: true });
  doc.addEventListener('touchstart', onIntent, { passive: true });
  doc.addEventListener('focusin', onIntent);
  doc.addEventListener('click', onClick, true);

  const uninstall = () => {
    doc.removeEventListener('pointerover', onIntent);
    doc.removeEventListener('touchstart', onIntent);
    doc.removeEventListener('focusin', onIntent);
    doc.removeEventListener('click', onClick, true);
  };

  return { load, uninstall };
};
