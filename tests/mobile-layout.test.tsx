import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Navbar } from '@/src/components/sections/Navbar';
import { EfficiencySection } from '@/src/components/sections/EfficiencySection';
import { navCopy } from '@/content/sections/nav';
import { efficiencyCopy } from '@/content/sections/efficiency';

afterEach(cleanup);

/**
 * jsdom applies no media queries, so these check the structure the phone layout
 * relies on: the menu's behaviour, and which cells carry the md-only classes.
 */

const menuButton = () => screen.getByRole('button', { name: /menu/i });

describe('the mobile menu', () => {
  it('is closed until the button is pressed', () => {
    render(<Navbar />);

    expect(menuButton().getAttribute('aria-expanded')).toBe('false');
    expect(document.getElementById('mobile-menu')).toBeNull();
  });

  it('opens with every section link and the Experience page', () => {
    render(<Navbar />);
    fireEvent.click(menuButton());

    const menu = document.getElementById('mobile-menu')!;
    const hrefs = [...menu.querySelectorAll('a')].map((a) => a.getAttribute('href'));

    expect(menuButton().getAttribute('aria-expanded')).toBe('true');
    expect(hrefs).toEqual([...navCopy.links.map(({ id }) => `#${id}`), navCopy.experience.href]);
  });

  it('closes when a link is chosen', async () => {
    render(<Navbar />);
    fireEvent.click(menuButton());
    fireEvent.click(screen.getAllByText(navCopy.links[0].label).at(-1)!);

    await act(async () => {});
    expect(menuButton().getAttribute('aria-expanded')).toBe('false');
  });

  it('closes on Escape', async () => {
    render(<Navbar />);
    fireEvent.click(menuButton());
    fireEvent.keyDown(window, { key: 'Escape' });

    await act(async () => {});
    expect(menuButton().getAttribute('aria-expanded')).toBe('false');
  });

  it('is only offered below md, where the inline links are hidden', () => {
    render(<Navbar />);
    expect(menuButton().className).toContain('md:hidden');
  });
});

describe('the Efficiency table at phone width', () => {
  it('drops the Delta column below md, header and rows alike', () => {
    const { container } = render(<EfficiencySection />);
    const deltaCells = [...container.querySelectorAll('.grid-cols-12 > :last-child')];

    // One header plus one per row, and every one of them hidden on phones.
    expect(deltaCells).toHaveLength(efficiencyCopy.rows.length + 1);
    for (const cell of deltaCells) {
      expect(cell.className).toContain('hidden');
      expect(cell.className).toContain('md:block');
    }
  });

  it('gives Process the freed span on phones, so the row still fills 12 columns', () => {
    const { container } = render(<EfficiencySection />);
    const processCell = container.querySelector('.grid-cols-12 > :first-child')!;

    expect(processCell.className).toContain('col-span-5');
    expect(processCell.className).toContain('md:col-span-4');
  });
});
