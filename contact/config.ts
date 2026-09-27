/**
 * The contact endpoint's environment, read in one place instead of scattered
 * `process.env` lookups through the request handler.
 *
 * Only secrets live here. Where an Inquiry is sent, and who it is sent from,
 * are Identity facts — see content/identity.ts.
 */

export type ContactConfig = {
  turnstileSecret: string;
  resendApiKey: string;
};

export type EnvSource = Record<string, string | undefined>;

/** Returns null when anything required is missing. An empty string counts as missing. */
export const readContactConfig = (env: EnvSource = process.env): ContactConfig | null => {
  const turnstileSecret = env.TURNSTILE_SECRET_KEY;
  const resendApiKey = env.RESEND_API_KEY;

  if (!turnstileSecret || !resendApiKey) return null;

  return { turnstileSecret, resendApiKey };
};

/** What is missing, for the log line when configuration fails. */
export const describeMissing = (env: EnvSource = process.env) => ({
  hasTurnstileSecret: Boolean(env.TURNSTILE_SECRET_KEY),
  hasResendApiKey: Boolean(env.RESEND_API_KEY),
});
