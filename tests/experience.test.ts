import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { identity } from '@/content/identity';
import { experienceTokens, renderHtml, tokensFor } from '@/content/html-tokens';
import { experienceCopy } from '@/content/sections/experience';

const ROOT = join(__dirname, '..');
const source = readFileSync(join(ROOT, 'experience.html'), 'utf8');
const indexSource = readFileSync(join(ROOT, 'index.html'), 'utf8');
const rendered = renderHtml(source, 'experience.html');
const indexRendered = renderHtml(indexSource, 'index.html');

describe.each([
  ['experience.html', source, rendered],
  ['index.html', indexSource, indexRendered],
])('every placeholder %s declares has a value', (filename, src, out) => {
  const declared = [...new Set(src.match(/%[A-Z_]+%/g) ?? [])];

  it('finds placeholders to check', () => {
    expect(declared.length).toBeGreaterThan(0);
  });

  it.each(declared)('%s has a replacement', (token) => {
    expect(Object.keys(tokensFor(filename))).toContain(token);
  });

  it('leaves no placeholder in the rendered output', () => {
    expect(out.match(/%[A-Z_]+%/g)).toBeNull();
  });
});

describe('the film declares the tokens only it needs', () => {
  it('keeps its Copy tokens out of index.html', () => {
    expect(Object.keys(experienceTokens)).toContain('%DELTA_ROWS%');
    expect(Object.keys(tokensFor('index.html'))).not.toContain('%DELTA_ROWS%');
  });
});

/**
 * The film used to be a full fork: its own hardcoded address, its own nav, and
 * Lenis pulled from unpkg at runtime. These are what stop it drifting back.
 */
describe('the film does not fork Identity', () => {
  it('never spells out the contact address in its markup', () => {
    expect(source).not.toContain(identity.email);
  });

  it('never hardcodes the booking slug in its markup', () => {
    expect(source).not.toContain(identity.booking.slug);
  });

  it('takes the booking slug from Identity when rendered', () => {
    expect(rendered).toContain(identity.booking.slug);
  });
});

describe('the film reaches the rest of the site', () => {
  it('books a call rather than opening a mail client', () => {
    expect(source).not.toContain('mailto:');
    expect(rendered).toContain('data-cal-link');
  });

  it('links to the privacy policy, which is otherwise unreachable from here', () => {
    const privacy = experienceCopy.footer.links.find((l) => l.label === 'Privacy');
    expect(privacy?.href).toBe('/?privacy=1');
    expect(rendered).toContain('/?privacy=1');
  });
});

describe('the film has no runtime dependency outside the lockfile', () => {
  it('does not pull Lenis, or anything else, from a CDN at runtime', () => {
    expect(source).not.toContain('unpkg.com');
    expect(source).not.toMatch(/<script[^>]+src="https?:\/\/(?!app\.cal\.com)/);
  });

  it('loads its engine as a bundled module', () => {
    expect(source).toContain('type="module"');
    expect(source).toContain('/src/experience/film.ts');
  });
});

describe('the film keeps its own editorial voice', () => {
  it('runs a shorter delta table than the main site, deliberately', () => {
    expect(experienceCopy.proof.rows).toHaveLength(4);
    expect(rendered).toContain('99% faster');
    expect(rendered).not.toContain('99% time reduction');
  });

  it('renders every capability and delta row it declares', () => {
    for (const item of experienceCopy.capabilities.items) {
      expect(rendered).toContain(item.title);
    }
    for (const row of experienceCopy.proof.rows) {
      expect(rendered).toContain(row.process);
    }
  });
});
