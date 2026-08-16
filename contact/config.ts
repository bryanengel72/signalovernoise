/**
 * The contact endpoint's environment, read in one place instead of three
 * `process.env` lookups scattered through the request handler.
 */

export type ContactConfig = {
  turnstileSecret: string;
  supabaseUrl: string;
  serviceRoleKey: string;
};

export type EnvSource = Record<string, string | undefined>;

/**
 * Returns null when anything required is missing.
 *
 * This used to fall back to `VITE_SUPABASE_URL`, because that was the only name
 * set in the Vercel project and deleting it would have taken the contact form
 * down. `VITE_` is a load-bearing prefix — it means "compiled into the public
 * browser bundle" — so reading one server-side inverted the single convention
 * that makes the client/server split legible.
 *
 * `SUPABASE_URL` is set now, confirmed by the fallback's warning going silent in
 * production, so the fallback is gone and the VITE_ name is inert.
 */
export const readContactConfig = (env: EnvSource = process.env): ContactConfig | null => {
  const turnstileSecret = env.TURNSTILE_SECRET_KEY;
  const supabaseUrl = env.SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!turnstileSecret || !supabaseUrl || !serviceRoleKey) return null;

  return { turnstileSecret, supabaseUrl, serviceRoleKey };
};

/** What is missing, for the log line when configuration fails. */
export const describeMissing = (env: EnvSource = process.env) => ({
  hasTurnstileSecret: Boolean(env.TURNSTILE_SECRET_KEY),
  hasSupabaseUrl: Boolean(env.SUPABASE_URL),
  hasServiceRoleKey: Boolean(env.SUPABASE_SERVICE_ROLE_KEY),
});
