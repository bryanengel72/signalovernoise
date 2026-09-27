import { identity } from '../identity.js';

export type FooterCopy = {
  copyright: string;
  links: ReadonlyArray<{ label: string; href: string }>;
  privacyLabel: string;
};

export const footerCopy: FooterCopy = {
  copyright: `© ${identity.copyrightYear} ${identity.name.toUpperCase()}.`,
  links: [{ label: 'LinkedIn', href: identity.linkedin }],
  privacyLabel: 'Privacy Policy',
};
