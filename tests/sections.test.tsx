import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { ServicesSection } from '@/src/components/sections/ServicesSection';
import { ProblemSection } from '@/src/components/sections/ProblemSection';
import { EfficiencySection } from '@/src/components/sections/EfficiencySection';
import { AboutSection } from '@/src/components/sections/AboutSection';

import { servicesCopy, type ServicesCopy } from '@/content/sections/services';
import { problemCopy, type ProblemCopy } from '@/content/sections/problem';
import { efficiencyCopy, type EfficiencyCopy } from '@/content/sections/efficiency';
import { aboutCopy, type AboutCopy } from '@/content/sections/about';

afterEach(cleanup);

/**
 * These are what make the `copy` prop a real seam rather than one caller and a
 * hypothesis: each Section is rendered twice, once against the site's Copy and
 * once against a fixture that shares none of its words.
 */

describe('Sections render the Copy they are given', () => {
  it('ServicesSection renders fixture Copy, not the site Copy', () => {
    const fixture: ServicesCopy = {
      eyebrow: 'FIXTURE EYEBROW',
      headline: { lead: 'Fixture lead', emphasis: 'Fixture emphasis' },
      intro: 'Fixture intro paragraph.',
      services: [{ num: '99', title: 'Fixture Service', desc: 'Fixture description.' }],
    };

    const { container } = render(<ServicesSection copy={fixture} />);
    const text = container.textContent ?? '';

    expect(text).toContain('FIXTURE EYEBROW');
    expect(text).toContain('Fixture Service');
    expect(text).toContain('99');
    expect(text).not.toContain(servicesCopy.services[0].title);
  });

  it('ProblemSection renders one card per entry and resolves the icon key', () => {
    const fixture: ProblemCopy = {
      eyebrow: 'FIXTURE PROBLEM',
      headline: { lead: 'Lead', emphasis: 'Emphasis' },
      intro: 'Intro.',
      cards: [
        { icon: 'activity', title: 'First Fixture Card', desc: 'One.' },
        { icon: 'network', title: 'Second Fixture Card', desc: 'Two.' },
      ],
    };

    const { container } = render(<ProblemSection copy={fixture} />);
    const text = container.textContent ?? '';

    expect(text).toContain('First Fixture Card');
    expect(text).toContain('Second Fixture Card');
    // Every icon key in Copy must resolve to a rendered lucide svg.
    expect(container.querySelectorAll('svg').length).toBeGreaterThanOrEqual(2);
  });

  it('EfficiencySection renders every row it is given', () => {
    const fixture: EfficiencyCopy = {
      eyebrow: 'FIXTURE RESULTS',
      headline: { lead: 'Lead', emphasis: 'Emphasis' },
      intro: 'Intro.',
      columns: { process: 'P', before: 'B', after: 'A', gain: 'G' },
      rows: [
        { process: 'Fixture Process One', before: '1 hr', after: 'instant', gain: '100%' },
        { process: 'Fixture Process Two', before: '2 hr', after: 'instant', gain: '100%' },
        { process: 'Fixture Process Three', before: '3 hr', after: 'instant', gain: '100%' },
      ],
    };

    const { container } = render(<EfficiencySection copy={fixture} />);
    const text = container.textContent ?? '';

    for (const row of fixture.rows) {
      expect(text).toContain(row.process);
    }
    expect(text).not.toContain('Competitive Intelligence');
  });

  it('AboutSection renders fixture pillars and credentials', () => {
    const fixture: AboutCopy = {
      eyebrow: 'FIXTURE ABOUT',
      headline: { lead: 'Lead', emphasis: 'Emphasis', trail: 'Trail' },
      pillars: [{ icon: 'cpu', label: 'Label', title: 'Fixture Pillar', desc: 'Desc.' }],
      credentialsLabel: 'Fixture Credentials',
      credentials: ['Fixture Credential A', 'Fixture Credential B'],
    };

    const { container } = render(<AboutSection copy={fixture} />);
    const text = container.textContent ?? '';

    expect(text).toContain('Fixture Pillar');
    expect(text).toContain('Fixture Credential A');
    expect(text).toContain('Fixture Credential B');
    expect(text).not.toContain('PMP Certified Professional');
  });
});

describe('Sections fall back to the site Copy', () => {
  it('renders the real Copy when no prop is passed', () => {
    const { container } = render(<ServicesSection />);
    const text = container.textContent ?? '';

    expect(text).toContain(servicesCopy.eyebrow);
    for (const service of servicesCopy.services) {
      expect(text).toContain(service.title);
    }
  });

  it('keeps the About credentials label in sync with Identity', () => {
    const { container } = render(<AboutSection />);
    expect(container.textContent ?? '').toContain(aboutCopy.credentialsLabel);
  });

  it('keeps the Problem intro in sync with Copy', () => {
    const { container } = render(<ProblemSection />);
    expect(container.textContent ?? '').toContain(problemCopy.intro);
  });

  it('keeps the Efficiency rows in sync with Copy', () => {
    const { container } = render(<EfficiencySection />);
    const text = container.textContent ?? '';
    for (const row of efficiencyCopy.rows) {
      expect(text).toContain(row.process);
    }
  });
});
