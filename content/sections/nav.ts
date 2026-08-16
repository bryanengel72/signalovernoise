import { identity } from '../identity';

export type NavCopy = {
  wordmark: string;
  links: ReadonlyArray<{ label: string; id: string }>;
  experience: { label: string; href: string };
  cta: string;
};

export const navCopy: NavCopy = {
  wordmark: identity.shortName,
  links: [
    { label: 'Services', id: 'services' },
    { label: 'Process', id: 'process' },
    { label: 'About', id: 'about' },
  ],
  experience: { label: 'Experience', href: '/experience.html' },
  cta: 'Get Started',
};
