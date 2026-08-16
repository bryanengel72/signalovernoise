/**
 * HumanCheck — the seam in front of Cloudflare Turnstile.
 *
 * Two adapters justify it: `turnstileHumanCheck` talks to Cloudflare in
 * production, `stubHumanCheck` answers instantly in tests. Before the seam
 * existed, `fetch` was called from inside the request handler and no test could
 * run without the network.
 */

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export type HumanVerdict = { ok: boolean; codes: string[] };

export type HumanCheck = (token: string, ip: string) => Promise<HumanVerdict>;

/** Production adapter. `fetchImpl` is injectable so the adapter itself is testable. */
export const turnstileHumanCheck =
  (secret: string, fetchImpl: typeof fetch = fetch): HumanCheck =>
  async (token, ip) => {
    const form = new URLSearchParams({ secret, response: token });
    if (ip) form.set('remoteip', ip);

    try {
      const response = await fetchImpl(TURNSTILE_VERIFY_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: form,
      });
      const result = (await response.json()) as {
        success?: boolean;
        'error-codes'?: string[];
      };
      return { ok: result.success === true, codes: result['error-codes'] ?? [] };
    } catch (error) {
      console.error('contact: turnstile verification request failed', error);
      return { ok: false, codes: ['verification-unreachable'] };
    }
  };

/** Test adapter. Records what it was asked about so assertions can check it. */
export const stubHumanCheck = (verdict: HumanVerdict = { ok: true, codes: [] }) => {
  const calls: Array<{ token: string; ip: string }> = [];
  const check: HumanCheck = async (token, ip) => {
    calls.push({ token, ip });
    return verdict;
  };
  return Object.assign(check, { calls });
};
