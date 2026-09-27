import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const tracked = vi.hoisted(() => [] as Array<[string, Record<string, string> | undefined]>);
vi.mock('@vercel/analytics', () => ({
  track: (name: string, props?: Record<string, string>) => tracked.push([name, props]),
}));

import { EVENTS, installAnalytics, trackEvent } from '@/src/analytics';
import { installLazyCal } from '@/src/booking/cal';
import { HeroSection } from '@/src/components/sections/HeroSection';
import { Navbar } from '@/src/components/sections/Navbar';

beforeEach(() => {
  tracked.length = 0;
  delete window.Cal;
});
afterEach(cleanup);

describe('installAnalytics', () => {
  it('sets up CTA click tracking', () => {
    // installAnalytics() now only sets up click tracking, not the inject calls
    // The Analytics and SpeedInsights components handle injection automatically
    const result = installAnalytics();
    expect(result).toBeUndefined();
  });

  it('counts a click on a marked CTA, by its label', () => {
    installAnalytics();
    // installAnalytics' listener from the test above is already on the document.
    render(<Navbar />);
    fireEvent.click(screen.getByText('Get Started'));
    expect(tracked).toContainEqual([EVENTS.ctaClick, { cta: 'nav-get-started' }]);
  });

  it('counts the hero audit CTA', () => {
    render(<HeroSection />);
    fireEvent.click(screen.getByText(/Free AI Audit/));
    expect(tracked).toContainEqual([EVENTS.ctaClick, { cta: 'hero-audit' }]);
  });
});

describe('booking events', () => {
  it('reports which booking button opened the modal', () => {
    const cal = installLazyCal({ onOpen: (source) => trackEvent(EVENTS.bookingOpened, { source }) });
    render(<HeroSection />);

    fireEvent.click(screen.getByText('Book Consultation'));

    expect(tracked).toContainEqual([EVENTS.bookingOpened, { source: 'hero-book' }]);
    cal.uninstall();
  });

  it('asks Cal to report completed bookings', () => {
    const onBooked = vi.fn();
    const cal = installLazyCal({ onBooked });
    cal.load();

    const queued = window.Cal!.ns!['30min'].q!;
    const subscription = queued.find(([command]) => command === 'on') as [string, { action: string; callback: () => void }];
    expect(subscription[1].action).toBe('bookingSuccessful');

    subscription[1].callback();
    expect(onBooked).toHaveBeenCalled();
    cal.uninstall();
  });
});

describe('the contact form', () => {
  it('counts a delivered inquiry', async () => {
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', 'test-site-key');
    window.turnstile = {
      render: (_el, opts) => {
        (opts as { callback: (t: string) => void }).callback('token');
        return 'w';
      },
      reset: () => {},
      remove: () => {},
    };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"ok":true}', { status: 200 }));
    vi.resetModules();
    const { ContactSection } = await import('@/src/components/sections/ContactSection');

    render(<ContactSection />);
    fireEvent.focus(screen.getByLabelText('Name'));
    await waitFor(() =>
      expect((screen.getByRole('button', { name: /send message/i }) as HTMLButtonElement).disabled).toBe(false),
    );
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Ada' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ada@example.com' } });
    fireEvent.change(screen.getByLabelText('What are you working on?'), { target: { value: 'Hi' } });
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /send message/i }).closest('form')!);
    });

    await screen.findByText('Message Sent');
    expect(tracked).toContainEqual([EVENTS.inquirySent, undefined]);

    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    delete window.turnstile;
  });
});
