import { identity } from '../identity.js';

/**
 * Privacy Copy.
 *
 * Legal text, so it is the Copy least tolerant of a typo — and it previously
 * carried one: the contact clause read "byan@" where every other copy of the
 * address read "bryan@". The address is now interpolated from Identity, so that
 * class of bug cannot recur here.
 */
export type PrivacyCopy = {
  eyebrow: string;
  title: string;
  lastUpdated: string;
  preamble: { lead: string; domain: string; trail: string };
  sections: ReadonlyArray<{ title: string; body: string }>;
  footer: string;
};

export const privacyCopy: PrivacyCopy = {
  eyebrow: 'Data.Privacy',
  title: 'Privacy Policy',
  lastUpdated: 'Last updated: March 2026',
  preamble: {
    lead: `${identity.name} ("Company", "we", "us", or "our") is committed to protecting your personal information. This Privacy Policy describes how we collect, use, and share information when you visit`,
    domain: identity.domain,
    trail: 'or contact us.',
  },
  sections: [
    {
      title: '1. Information We Collect',
      body: `We may collect the following types of information:

• Contact information you provide voluntarily — such as your name, email address, and company name — when you submit our contact form.
• Usage data automatically collected by your browser, including IP address, browser type, pages visited, and referring URLs.
• Communications you send us directly via email or the contact form.

We do not use tracking cookies or third-party advertising pixels.`,
    },
    {
      title: '2. How We Use Your Information',
      body: `We use the information we collect to:

• Respond to your inquiries and fulfill service requests.
• Schedule and conduct discovery calls or consultations.
• Improve our website and service offering.
• Comply with legal obligations.

We will never sell, rent, or share your personal information with third parties for marketing purposes.`,
    },
    {
      title: '3. Data Retention',
      body: `We retain contact form submissions and correspondence only as long as necessary to complete the requested engagement or fulfill our legal obligations. If you would like your data deleted, contact us at ${identity.email} and we will process your request within 30 days.`,
    },
    {
      title: '4. Third-Party Services',
      body: `Our site may use limited third-party services for analytics or form processing (e.g., Supabase for form storage, and Cloudflare Turnstile to confirm that contact form submissions come from a person rather than automated software). These services have their own privacy policies governing their use of your data. We do not share your information with any third party beyond what is strictly necessary to operate the site.`,
    },
    {
      title: '5. Security',
      body: `We implement reasonable technical and organizational measures to protect your personal information. All data transmitted to and from our site is encrypted via HTTPS. However, no transmission over the internet is 100% secure, and we cannot guarantee absolute security.`,
    },
    {
      title: '6. Your Rights',
      body: `Depending on your jurisdiction, you may have rights to:

• Access the personal information we hold about you.
• Request correction of inaccurate information.
• Request deletion of your data.
• Opt out of future communications at any time.

To exercise any of these rights, contact us at ${identity.email}.`,
    },
    {
      title: "7. Children's Privacy",
      body: `Our services are not directed to individuals under the age of 16. We do not knowingly collect personal information from minors. If you believe a minor has submitted information to us, please contact us and we will promptly delete it.`,
    },
    {
      title: '8. Changes to This Policy',
      body: `We may update this Privacy Policy periodically to reflect changes in our practices or applicable law. We will update the "Last updated" date at the top of this page. Continued use of the site after any changes constitutes your acceptance of the revised policy.`,
    },
    {
      title: '9. Contact',
      body: `If you have any questions or concerns about this Privacy Policy, please contact us:\n\n${identity.name}\n${identity.email}`,
    },
  ],
  footer: `© ${identity.copyrightYear} ${identity.name}. All rights reserved.`,
};
