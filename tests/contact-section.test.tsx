import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The form's failure path, with a fake Turnstile that behaves like the real one
 * in Managed mode: it passes on render, and passes again right after reset().
 *
 * That second pass used to clear every error, so a failed send flashed its
 * message for a second and left the visitor looking at an untouched form.
 */

type WidgetOptions = { callback: (token: string) => void };

const installFakeTurnstile = () => {
  let options: WidgetOptions | null = null;
  window.turnstile = {
    render: (_el, opts) => {
      options = opts as unknown as WidgetOptions;
      options.callback('token-1');
      return 'widget-1';
    },
    reset: () => options?.callback('token-2'),
    remove: () => {},
  };
};

/** An IntersectionObserver that reports every target as on screen straight away. */
class OnScreenObserver {
  constructor(private readonly callback: IntersectionObserverCallback) {}
  observe(target: Element) {
    this.callback([{ isIntersecting: true, target } as IntersectionObserverEntry], this as never);
  }
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

const loadSection = async () => {
  vi.stubEnv('VITE_TURNSTILE_SITE_KEY', 'test-site-key');
  vi.resetModules();
  const { ContactSection } = await import('@/src/components/sections/ContactSection');
  return ContactSection;
};

const sendButton = () => screen.getByRole('button', { name: /send message/i }) as HTMLButtonElement;
const messageField = () => screen.getByLabelText('What are you working on?') as HTMLTextAreaElement;

const fillAndSend = () => {
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Ada' } });
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ada@example.com' } });
  fireEvent.change(screen.getByLabelText('What are you working on?'), {
    target: { value: 'Hello' },
  });
  fireEvent.submit(sendButton().closest('form')!);
};

const realObserver = globalThis.IntersectionObserver;

beforeEach(() => {
  installFakeTurnstile();
  globalThis.IntersectionObserver = OnScreenObserver as unknown as typeof IntersectionObserver;
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  globalThis.IntersectionObserver = realObserver;
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  delete window.turnstile;
});

describe('ContactSection when the send fails', () => {
  it('keeps the error on screen after the human check re-passes', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'We could not send your message.' }), { status: 500 }),
    );
    const ContactSection = await loadSection();

    render(<ContactSection />);
    await waitFor(() => expect(sendButton().disabled).toBe(false));

    await act(async () => fillAndSend());

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('We could not send your message.');

    // The reset has fired and handed over a fresh token; the message must survive it.
    await act(async () => {});
    expect(screen.getByRole('alert').textContent).toContain('We could not send your message.');
    expect(sendButton().disabled).toBe(false);
  });

  it('keeps what the visitor typed so they can retry', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 500 }));
    const ContactSection = await loadSection();

    render(<ContactSection />);
    await waitFor(() => expect(sendButton().disabled).toBe(false));
    await act(async () => fillAndSend());

    await screen.findByRole('alert');
    expect(messageField().value).toBe('Hello');
  });

  it('clears the form and confirms when the send succeeds', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );
    const ContactSection = await loadSection();

    render(<ContactSection />);
    await waitFor(() => expect(sendButton().disabled).toBe(false));
    await act(async () => fillAndSend());

    expect(await screen.findByText('Message Sent')).toBeTruthy();
    expect(messageField().value).toBe('');
  });
});

describe('ContactSection before the form is near the screen', () => {
  it('does not load the human check until the form approaches or takes focus', async () => {
    globalThis.IntersectionObserver = realObserver; // the setup stub never reports anything
    const render_ = vi.spyOn(window.turnstile!, 'render');
    const ContactSection = await loadSection();

    render(<ContactSection />);
    await act(async () => {});
    expect(render_).not.toHaveBeenCalled();

    fireEvent.focus(screen.getByLabelText('Name'));
    await waitFor(() => expect(render_).toHaveBeenCalledTimes(1));
  });
});
