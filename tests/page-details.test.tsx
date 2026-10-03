import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { ContactSection } from '@/src/components/sections/ContactSection';
import { Footer } from '@/src/components/sections/Footer';
import { HeroSection } from '@/src/components/sections/HeroSection';
import { ProcessSection } from '@/src/components/sections/ProcessSection';
import { FIELD_LIMITS } from '@/contact/inquiry';
import { identity } from '@/content/identity';
import { contactCopy } from '@/content/sections/contact';

afterEach(cleanup);

describe('the contact form', () => {
  it.each([
    ['Name', 'name', FIELD_LIMITS.name],
    ['Email', 'email', FIELD_LIMITS.email],
    ['Company', 'organization', FIELD_LIMITS.company],
  ] as const)('%s autofills and stops at the server limit', (label, autoComplete, limit) => {
    render(<ContactSection />);
    const field = screen.getByLabelText(label) as HTMLInputElement;

    expect(field.getAttribute('autocomplete')).toBe(autoComplete);
    expect(field.maxLength).toBe(limit);
  });

  it('stops the message at the server limit rather than truncating it silently', () => {
    render(<ContactSection />);
    const message = screen.getByLabelText(contactCopy.fields.message.label) as HTMLTextAreaElement;

    expect(message.maxLength).toBe(FIELD_LIMITS.message);
  });

  it('makes the email address a mailto link', () => {
    render(<ContactSection />);
    const link = screen.getByText(identity.email).closest('a');

    expect(link?.getAttribute('href')).toBe(`mailto:${identity.email}`);
  });
});

describe('the booking buttons', () => {
  it('the hero button carries the same Cal namespace and config as the Contact one', () => {
    const { container } = render(<><HeroSection /><ContactSection /></>);
    const buttons = [...container.querySelectorAll('button[data-cal-link]')];

    expect(buttons).toHaveLength(2);
    for (const button of buttons) {
      expect(button.getAttribute('data-cal-link')).toBe(identity.booking.slug);
      expect(button.getAttribute('data-cal-namespace')).toBe(identity.booking.namespace);
      expect(button.getAttribute('data-cal-config')).toBe(identity.booking.config);
    }
  });
});

describe('the footer', () => {
  it('links to LinkedIn in a new tab', () => {
    render(<Footer />);
    const link = screen.getByText('LinkedIn').closest('a')!;

    expect(link.getAttribute('href')).toBe(identity.linkedin);
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
  });
});

describe('the Process connectors', () => {
  it('sit outside the card that clips its contents', () => {
    const { container } = render(<ProcessSection />);
    const connectors = [...container.querySelectorAll('.-right-6')];

    expect(connectors.length).toBeGreaterThan(0);
    for (const connector of connectors) {
      expect(connector.closest('.overflow-hidden')).toBeNull();
    }
  });
});

describe('the cursor', () => {
  it('gives the hand only to things you press, never to text fields', () => {
    const css = readFileSync(join(__dirname, '..', 'src/index.css'), 'utf8');
    const rule = css.match(/([^{}]*)\{\s*cursor:\s*pointer;/)?.[1] ?? '';

    expect(rule).toMatch(/\ba\b/);
    expect(rule).not.toMatch(/\binput\b|\btextarea\b/);
  });
});
