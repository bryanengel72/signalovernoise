import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { installLazyCal } from '@/src/booking/cal';
import { identity } from '@/content/identity';

/**
 * The lazy Cal loader, against jsdom. jsdom never fetches the script, so "ready"
 * is simulated by dispatching its load event.
 */

const EMBED = 'script[src="https://app.cal.com/embed/embed.js"]';

let button: HTMLButtonElement;
let installed: ReturnType<typeof installLazyCal> | null = null;
const install = () => (installed = installLazyCal());

beforeEach(() => {
  delete window.Cal;
  document.head.querySelectorAll('script').forEach((s) => s.remove());
  button = document.createElement('button');
  button.dataset.calLink = identity.booking.slug;
  button.dataset.calNamespace = identity.booking.namespace;
  button.dataset.calConfig = identity.booking.config;
  document.body.appendChild(button);
});

afterEach(() => {
  installed?.uninstall();
  installed = null;
  button.remove();
});

const queued = () => window.Cal!.ns![identity.booking.namespace].q ?? [];

describe('installLazyCal', () => {
  it('fetches nothing on page load', () => {
    install();

    expect(document.querySelector(EMBED)).toBeNull();
    expect(window.Cal).toBeUndefined();
  });

  it('starts loading when a booking button is pointed at', () => {
    install();
    button.dispatchEvent(new Event('pointerover', { bubbles: true }));

    expect(document.querySelector(EMBED)).not.toBeNull();
    expect(queued()[0]).toEqual(['init', identity.booking.namespace, { origin: 'https://app.cal.com' }]);
  });

  it('ignores intent anywhere else on the page', () => {
    install();
    document.body.dispatchEvent(new Event('pointerover', { bubbles: true }));

    expect(document.querySelector(EMBED)).toBeNull();
  });

  it('queues the modal for a click that lands before the embed is ready', () => {
    install();
    button.click();

    expect(queued()).toContainEqual([
      'modal',
      { calLink: identity.booking.slug, config: JSON.parse(identity.booking.config) },
    ]);
  });

  it('leaves clicks to Cal once the embed has loaded', () => {
    install();
    button.dispatchEvent(new Event('pointerover', { bubbles: true }));
    document.querySelector(EMBED)!.dispatchEvent(new Event('load'));

    button.click();

    expect(queued().some(([command]) => command === 'modal')).toBe(false);
  });
});
