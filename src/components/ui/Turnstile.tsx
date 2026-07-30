import { useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react';

/**
 * Cloudflare Turnstile widget, rendered explicitly so it survives React's
 * mount/unmount cycle. Tokens are single-use and expire after ~5 minutes, so the
 * parent gets a `reset()` handle to fetch a fresh one after a failed submit.
 */

type TurnstileApi = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
    onSignalTurnstileLoad?: () => void;
  }
}

const SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onSignalTurnstileLoad';

let scriptPromise: Promise<void> | null = null;

const loadTurnstile = () => {
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    if (window.turnstile) {
      resolve();
      return;
    }
    window.onSignalTurnstileLoad = () => resolve();

    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener('error', () => {
      scriptPromise = null;
      reject(new Error('Turnstile script failed to load'));
    });
    document.head.appendChild(script);
  });

  return scriptPromise;
};

export type TurnstileHandle = { reset: () => void };

type TurnstileProps = {
  siteKey: string;
  onToken: (token: string | null) => void;
  onError?: (message: string) => void;
  ref?: Ref<TurnstileHandle>;
};

export const Turnstile = ({ siteKey, onToken, onError, ref }: TurnstileProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  const onErrorRef = useRef(onError);

  // The normal/flexible widget will not render below 300px; drop to the compact
  // layout on narrow phones so it cannot overflow the form column.
  const [size] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(min-width: 420px)').matches
      ? 'flexible'
      : 'compact',
  );

  useEffect(() => {
    onTokenRef.current = onToken;
    onErrorRef.current = onError;
  });

  useEffect(() => {
    let cancelled = false;

    loadTurnstile()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: 'dark',
          size,
          action: 'contact',
          callback: (token: string) => onTokenRef.current(token),
          'expired-callback': () => onTokenRef.current(null),
          'timeout-callback': () => onTokenRef.current(null),
          'error-callback': () => onTokenRef.current(null),
        });
      })
      .catch(() => {
        if (cancelled) return;
        onErrorRef.current?.(
          'The human check could not load. Check your connection, or email bryan@signalovernoiseai.com.',
        );
      });

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, size]);

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current);
      }
    },
  }));

  return <div ref={containerRef} className="min-h-[65px]" />;
};
