import { identity } from '../identity.js';

export type FooterCopy = {
  copyright: string;
  links: ReadonlyArray<{ label: string; href: string }>;
  privacyLabel: string;
};

export const footerCopy: FooterCopy = {
  copyright: `© ${identity.copyrightYear} ${identity.name.toUpperCase()}.`,
  /** Empty until there is somewhere to point it. A link to '#' is worse than no link. */
  links: [],
  privacyLabel: 'Privacy Policy',
};
