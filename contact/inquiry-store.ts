import { createClient } from '@supabase/supabase-js';
import type { Inquiry } from './inquiry';

/**
 * InquiryStore — the seam in front of Supabase.
 *
 * Two adapters justify it: `supabaseInquiryStore` writes to the
 * `booking_inquiries` table with the service-role key in production,
 * `inMemoryInquiryStore` collects them in an array in tests.
 *
 * The write is server-only by design — `supabase/lockdown.sql` revokes all
 * privileges from `anon`, which is what makes the Turnstile gate impossible to
 * bypass with the public key.
 */

/**
 * Deliberately not a discriminated union: this project does not compile with
 * `strict`, so `if (!result.ok)` would not narrow one.
 */
export type SaveResult = { ok: boolean; error?: unknown };

export type InquiryStore = {
  save: (inquiry: Inquiry) => Promise<SaveResult>;
};

export const supabaseInquiryStore = (url: string, serviceRoleKey: string): InquiryStore => ({
  save: async (inquiry) => {
    const supabase = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { error } = await supabase.from('booking_inquiries').insert([inquiry]);
    return error ? { ok: false, error } : { ok: true };
  },
});

/** Test adapter. `failWith` makes the save-failure branch reachable without a network. */
export const inMemoryInquiryStore = (failWith?: unknown) => {
  const saved: Inquiry[] = [];
  const store: InquiryStore = {
    save: async (inquiry) => {
      if (failWith !== undefined) return { ok: false, error: failWith };
      saved.push(inquiry);
      return { ok: true };
    },
  };
  return Object.assign(store, { saved });
};
