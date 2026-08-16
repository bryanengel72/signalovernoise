import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { SectionHeader } from '@/src/components/ui/SectionHeader';
import { ProblemSection } from '@/src/components/sections/ProblemSection';
import { ServicesSection } from '@/src/components/sections/ServicesSection';
import { EfficiencySection } from '@/src/components/sections/EfficiencySection';
import { ProcessSection } from '@/src/components/sections/ProcessSection';
import { AboutSection } from '@/src/components/sections/AboutSection';

afterEach(cleanup);

const ROOT = join(__dirname, '..');
const SECTIONS_DIR = join(ROOT, 'src/components/sections');

describe('SectionHeader', () => {
  it('renders the eyebrow and both halves of the headline', () => {
    const { container } = render(
      <SectionHeader eyebrow="FIXTURE EYEBROW" headline={{ lead: 'Fixture lead', emphasis: 'Fixture emphasis.' }} />,
    );
    const text = container.textContent ?? '';

    expect(text).toContain('FIXTURE EYEBROW');
    expect(text).toContain('Fixture lead');
    expect(text).toContain('Fixture emphasis.');
  });

  it('renders the optional trail line', () => {
    const { container } = render(
      <SectionHeader
        eyebrow="E"
        headline={{ lead: 'Lead', emphasis: 'Emphasis', trail: 'Fixture trail line.' }}
      />,
    );
    expect(container.textContent ?? '').toContain('Fixture trail line.');
  });

  it('omits the trail when Copy does not supply one', () => {
    const { container } = render(
      <SectionHeader eyebrow="E" headline={{ lead: 'Lead', emphasis: 'Emphasis' }} />,
    );
    expect(container.querySelectorAll('br')).toHaveLength(0);
  });

  it('steps the headline down when compact', () => {
    const { container: normal } = render(
      <SectionHeader eyebrow="E" headline={{ lead: 'L', emphasis: 'E' }} />,
    );
    expect(normal.querySelector('h2')?.className).toContain('text-5xl');

    cleanup();

    const { container: compact } = render(
      <SectionHeader eyebrow="E" headline={{ lead: 'L', emphasis: 'E' }} compact />,
    );
    expect(compact.querySelector('h2')?.className).toContain('text-4xl');
  });

  it('spaces the eyebrow further when loose', () => {
    const { container: tight } = render(
      <SectionHeader eyebrow="E" headline={{ lead: 'L', emphasis: 'E' }} />,
    );
    expect(tight.firstElementChild?.className).toContain('mb-8');

    cleanup();

    const { container: loose } = render(
      <SectionHeader eyebrow="E" headline={{ lead: 'L', emphasis: 'E' }} looseEyebrow />,
    );
    expect(loose.firstElementChild?.className).toContain('mb-12');
  });
});

/**
 * The six copies had drifted twice before they were collapsed — one Section
 * rounded its dot, another weakened its highlight. These lock the shape in.
 */
describe('Every Section opens with the same header shape', () => {
  const sections = [
    ['Problem', <ProblemSection key="p" />],
    ['Services', <ServicesSection key="s" />],
    ['Efficiency', <EfficiencySection key="e" />],
    ['Process', <ProcessSection key="pr" />],
    ['About', <AboutSection key="a" />],
  ] as const;

  it.each(sections)('%s renders exactly one h2 with a bold highlight', (_name, element) => {
    const { container } = render(element);

    const headings = container.querySelectorAll('h2');
    expect(headings).toHaveLength(1);

    const highlight = headings[0].querySelector('span');
    expect(highlight?.className).toContain('font-bold');
    expect(highlight?.className).not.toContain('font-semibold');
  });

  it.each(sections)('%s renders a square eyebrow dot, never a round one', (_name, element) => {
    const { container } = render(element);

    const dot = container.querySelector('.bg-signal.w-2, .w-2.h-2.bg-signal');
    expect(dot).not.toBeNull();
    expect(dot?.className).not.toContain('rounded-full');
  });
});

describe('SectionHeader is the only place the header markup lives', () => {
  const EYEBROW_CLASSES = 'text-xs text-signal tracking-widest uppercase';

  const sectionFiles = readdirSync(SECTIONS_DIR)
    .map((entry) => join(SECTIONS_DIR, entry))
    .filter((full) => statSync(full).isFile() && full.endsWith('.tsx'));

  it('no Section hand-rolls the eyebrow block', () => {
    // PrivacyPage is an overlay, not a Section — its header bar is a different shape.
    const offenders = sectionFiles
      .filter((file) => !file.endsWith('PrivacyPage.tsx'))
      .filter((file) => readFileSync(file, 'utf8').includes(EYEBROW_CLASSES));

    expect(offenders.map((f) => relative(ROOT, f))).toEqual([]);
  });

  it('no Section hand-rolls the headline block', () => {
    const offenders = sectionFiles.filter((file) =>
      readFileSync(file, 'utf8').includes('font-light tracking-tight'),
    );

    expect(offenders.map((f) => relative(ROOT, f))).toEqual([]);
  });
});
