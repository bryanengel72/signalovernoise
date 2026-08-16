import { describeMissing, readContactConfig } from '../contact/config.js';
import { createContactHandler } from '../contact/handler.js';
import { turnstileHumanCheck } from '../contact/human-check.js';
import { supabaseInquiryStore } from '../contact/inquiry-store.js';
import { createRateLimiter } from '../contact/rate-limit.js';

/**
 * Contact endpoint — composition root.
 *
 * The decision logic lives in contact/handler.ts behind a seam; this file only
 * chooses the production adapters. Tests wire the same handler to an in-memory
 * store and a stub human check, which is why they need no network.
 *
 * The Supabase write uses the service-role key, which never leaves this runtime.
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
      store: supabaseInquiryStore(config.supabaseUrl, config.serviceRoleKey),
    };
  },
  isRateLimited,
});
