/**
 * The contact endpoint's environment, read in one place instead of three
 * `process.env` lookups scattered through the request handler.
 */

export type ContactConfig = {
  turnstileSecret: string;
  supabaseUrl: string;
  serviceRoleKey: string;
  /** True when the URL came from the legacy VITE_-prefixed name. */
  usedLegacySupabaseUrl: boolean;
};

export type EnvSource = Record<string, string | undefined>;

/**
 * `VITE_` is a load-bearing prefix — it means "compiled into the public browser
 * bundle" — so reading a VITE_ name server-side inverts the one convention that
 * makes the client/server split legible. The fallback survives because
 * SUPABASE_URL may not be set in the Vercel project, and removing it there
 * would take the contact form down (see README). `usedLegacySupabaseUrl` marks
 * when it fired so the cleanup is a check rather than a guess.
 *
 * Returns null when anything required is missing.
 */
export const readContactConfig = (env: EnvSource = process.env): ContactConfig | null => {
  const turnstileSecret = env.TURNSTILE_SECRET_KEY;
  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!turnstileSecret || !supabaseUrl || !serviceRoleKey) return null;

  return {
    turnstileSecret,
    supabaseUrl,
    serviceRoleKey,
    usedLegacySupabaseUrl: !env.SUPABASE_URL,
  };
};

/** What is missing, for the log line when configuration fails. */
export const describeMissing = (env: EnvSource = process.env) => ({
  hasTurnstileSecret: Boolean(env.TURNSTILE_SECRET_KEY),
  hasSupabaseUrl: Boolean(env.SUPABASE_URL || env.VITE_SUPABASE_URL),
  hasServiceRoleKey: Boolean(env.SUPABASE_SERVICE_ROLE_KEY),
});
