# Signal Over Noise AI

Marketing site for [Signal Over Noise AI](https://www.signalovernoiseai.com) — AI automation consulting for mid-market B2B.

Built with React 19, Vite, Tailwind CSS 4, and Motion. Discovery-call booking is handled by a Cal.com embed.

## Contact form

Submissions POST to `api/contact.ts`, a Vercel Function that:

1. drops anything that fills the hidden honeypot field,
2. throttles bursts from a single IP,
3. verifies a **Cloudflare Turnstile** token server-side, and
4. only then inserts into the Supabase `booking_inquiries` table using the service-role key.

The browser has no Supabase credentials at all, and `anon` has no privileges on
that table — see [`supabase/lockdown.sql`](supabase/lockdown.sql). Both halves
matter: without the DB lockdown, the human check is bypassable by POSTing
straight at the Supabase REST API.

### Turnstile setup

1. In the [Cloudflare dashboard](https://dash.cloudflare.com) → **Turnstile** → **Add widget**.
2. Add hostnames `signalovernoiseai.com`, `www.signalovernoiseai.com`, and `localhost`.
3. Widget mode **Managed** (invisible for real visitors, challenges suspicious traffic).
4. Copy the **site key** → `VITE_TURNSTILE_SITE_KEY`, and the **secret key** → `TURNSTILE_SECRET_KEY`.

## Run locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```
   npm install
   ```
2. Copy [`.env.example`](.env.example) to `.env.local` and fill it in. Cloudflare's
   test keys (`1x00000000000000000000AA` / `1x0000000000000000000000000000000AA`)
   always pass and work on localhost.
3. Start the dev server:
   ```
   npm run dev
   ```
   `npm run dev` serves the static site only — `/api/contact` does not exist under
   plain Vite. To exercise the contact form end to end, use `vercel dev` instead,
   which runs the function alongside the site.

## Scripts

- `npm run dev` — dev server on port 3000
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the production build locally
- `npm run lint` — type-check with `tsc --noEmit`

## Deployment

Deployed on Vercel as a static Vite site plus the `api/` function (see `vercel.json`).
Set the variables from `.env.example` in the Vercel project settings —
`VITE_TURNSTILE_SITE_KEY` is needed at build time, the rest at runtime. Env var
changes only take effect on a **redeploy**; editing them alone does nothing.

⚠️ `contact/config.ts` reads `SUPABASE_URL` but falls back to `VITE_SUPABASE_URL`.
If `SUPABASE_URL` is not set, **do not delete `VITE_SUPABASE_URL`** — it is what
the function is actually using, and removing it takes the contact form down. Add
`SUPABASE_URL` first, redeploy, then it is safe to remove. `VITE_SUPABASE_ANON_KEY`
is genuinely unused now and can go at any time.

You no longer have to guess which one is live: when the fallback fires, the
function logs `contact: falling back to VITE_SUPABASE_URL` on every request. If
that line is absent from the runtime logs after a deploy, `SUPABASE_URL` is set
and the VITE_ name is safe to remove.

## Tests

`npm test` runs the Vitest suite. The contact endpoint is tested through its
seam — `contact/handler.ts` takes a human check and an inquiry store, so the
tests wire the in-memory adapters from `contact/human-check.ts` and
`contact/inquiry-store.ts` and reach neither Cloudflare nor Supabase. No
network, no credentials, no `vercel dev` required.
