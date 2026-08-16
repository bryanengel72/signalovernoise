import { identity } from '../identity';

export type FooterCopy = {
  copyright: string;
  links: ReadonlyArray<{ label: string; href: string }>;
  privacyLabel: string;
};

export const footerCopy: FooterCopy = {
  copyright: `© ${identity.copyrightYear} ${identity.name.toUpperCase()}.`,
  links: [{ label: 'Blog', href: '#' }],
  privacyLabel: 'Privacy Policy',
};
