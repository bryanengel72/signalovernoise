import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface PrivacyPageProps {
  onClose: () => void;
}

export const PrivacyPage = ({ onClose }: PrivacyPageProps) => {
  return (
    <AnimatePresence>
      <motion.div
        key="privacy-overlay"
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        className="fixed inset-0 z-[200] bg-bg overflow-y-auto"
      >
        {/* Sticky header bar */}
        <div className="sticky top-0 z-10 backdrop-blur-xl bg-bg/80 border-b border-white/5 flex items-center justify-between px-8 py-5">
          <span className="text-xs text-signal tracking-widest uppercase font-semibold">Data.Privacy</span>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-muted hover:text-white hover:border-white/30 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-8 py-16 text-sm text-muted leading-relaxed space-y-10">

          <div>
            <h1 className="font-display text-4xl font-light text-white tracking-tight mb-3">Privacy Policy</h1>
            <p className="text-xs text-muted/60">Last updated: March 2026</p>
          </div>

          <p>
            Signal Over Noise AI ("Company", "we", "us", or "our") is committed to protecting your personal information. This Privacy Policy describes how we collect, use, and share information when you visit{' '}
            <span className="text-signal">signalovernoiseai.com</span> or contact us.
          </p>

          {[
            {
              title: "1. Information We Collect",
              body: `We may collect the following types of information:

• Contact information you provide voluntarily — such as your name, email address, and company name — when you submit our contact form.
• Usage data automatically collected by your browser, including IP address, browser type, pages visited, and referring URLs.
• Communications you send us directly via email or the contact form.

We do not use tracking cookies or third-party advertising pixels.`
            },
            {
              title: "2. How We Use Your Information",
              body: `We use the information we collect to:

• Respond to your inquiries and fulfill service requests.
• Schedule and conduct discovery calls or consultations.
• Improve our website and service offering.
• Comply with legal obligations.

We will never sell, rent, or share your personal information with third parties for marketing purposes.`
            },
            {
              title: "3. Data Retention",
              body: `We retain contact form submissions and correspondence only as long as necessary to complete the requested engagement or fulfill our legal obligations. If you would like your data deleted, contact us at bryan@signalovernoiseai.com and we will process your request within 30 days.`
            },
            {
              title: "4. Third-Party Services",
              body: `Our site may use limited third-party services for analytics or form processing (e.g., Supabase for form storage). These services have their own privacy policies governing their use of your data. We do not share your information with any third party beyond what is strictly necessary to operate the site.`
            },
            {
              title: "5. Security",
              body: `We implement reasonable technical and organizational measures to protect your personal information. All data transmitted to and from our site is encrypted via HTTPS. However, no transmission over the internet is 100% secure, and we cannot guarantee absolute security.`
            },
            {
              title: "6. Your Rights",
              body: `Depending on your jurisdiction, you may have rights to:

• Access the personal information we hold about you.
• Request correction of inaccurate information.
• Request deletion of your data.
• Opt out of future communications at any time.

To exercise any of these rights, contact us at bryan@signalovernoiseai.com.`
            },
            {
              title: "7. Children's Privacy",
              body: `Our services are not directed to individuals under the age of 16. We do not knowingly collect personal information from minors. If you believe a minor has submitted information to us, please contact us and we will promptly delete it.`
            },
            {
              title: "8. Changes to This Policy",
              body: `We may update this Privacy Policy periodically to reflect changes in our practices or applicable law. We will update the "Last updated" date at the top of this page. Continued use of the site after any changes constitutes your acceptance of the revised policy.`
            },
            {
              title: "9. Contact",
              body: `If you have any questions or concerns about this Privacy Policy, please contact us:\n\nSignal Over Noise AI\nbyan@signalovernoiseai.com`
            },
          ].map((section, i) => (
            <div key={i}>
              <h2 className="font-display text-lg font-semibold text-white mb-3">{section.title}</h2>
              <p className="whitespace-pre-line">{section.body}</p>
            </div>
          ))}

          <div className="pt-8 border-t border-white/5 text-xs text-muted/50">
            © 2026 Signal Over Noise AI. All rights reserved.
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
