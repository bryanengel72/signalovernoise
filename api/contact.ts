import { describeMissing, readContactConfig } from '../contact/config.js';
import { createContactHandler } from '../contact/handler.js';
import { turnstileHumanCheck } from '../contact/human-check.js';
import { resendInquiryInbox } from '../contact/inquiry-inbox.js';
import { createRateLimiter } from '../contact/rate-limit.js';
import { identity } from '../content/identity.js';

/**
 * Contact endpoint — composition root.
 *
 * The decision logic lives in contact/handler.ts behind a seam; this file only
 * chooses the production adapters. Tests wire the same handler to an in-memory
 * inbox and a stub human check, which is why they need no network.
 *
 * The Resend API key never leaves this runtime.
 */

// One limiter per function instance. Fluid Compute reuses instances, so this
// blunts bursts from a single IP; the Turnstile check is the real gate.
const isRateLimited = createRateLimiter();

export const POST = createContactHandler({
  services: () => {
    const config = readContactConfig();

    if (!config) {
      console.error('contact: missing environment configuration', describeMissing());
      return null;
    }

    return {
      humanCheck: turnstileHumanCheck(config.turnstileSecret),
      inbox: resendInquiryInbox({
        apiKey: config.resendApiKey,
        to: identity.email,
        from: identity.inquirySender,
      }),
    };
  },
  isRateLimited,
});
