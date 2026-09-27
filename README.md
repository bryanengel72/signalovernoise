# Signal Over Noise AI

Marketing site for [Signal Over Noise AI](https://www.signalovernoiseai.com) — AI automation consulting for mid-market B2B.

Built with React 19, Vite, Tailwind CSS 4, and Motion. Discovery-call booking is handled by a Cal.com embed.

## Contact form

Submissions POST to `api/contact.ts`, a Vercel Function that:

1. drops anything that fills the hidden honeypot field,
2. throttles bursts from a single IP,
3. verifies a **Cloudflare Turnstile** token server-side, and
4. only then emails the inquiry to the address in `content/identity.ts` through
   **Resend**, with Reply-To set to the visitor.

There is no database — the inbox is the record. If the send fails, the visitor
is told to email directly.

### Resend setup

1. Create an account at [resend.com](https://resend.com) and add
   `notify.signalovernoiseai.com` as a domain (region `us-east-1`). The sender in
   `content/identity.ts` must be on this subdomain.
2. Add the DNS records Resend lists (a DKIM TXT and two CNAMEs, all under
   `notify.`) at the domain's DNS host, Hostinger, then verify.
3. Create an API key with sending access **in the same Resend account** →
   `RESEND_API_KEY`. A key from another account gets "domain is not verified".

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
- `npm run build` — production build to `dist/`: the browser build, then a
  Node build of `src/entry-server.tsx`, then `scripts/prerender.mjs` writes the
  rendered page into `dist/index.html`
- `npm run preview` — serve the production build locally
- `npm run lint` — type-check with `tsc --noEmit`

## Pages

Three build entries:

- `index.html` — the React site. Pre-rendered at build time, so the HTML
  carries every Section for crawlers that do not run JavaScript; `main.tsx`
  hydrates it. `tests/prerender.test.tsx` fails on any hydration mismatch.
- `privacy.html` — the privacy policy at `/privacy`, a static page rendered from
  `content/sections/privacy.ts` like the scroll-film's Copy. No JavaScript.
- `experience.html` — **THE LOCK**, the scroll-film. Deliberately not React: its
  canvas frame-scrubbing engine lives in `src/experience/film.ts` and runs its own
  loop. Its Copy is in `content/sections/experience.ts` and is substituted into the
  markup at build time, so the shipped page is static HTML. Frames are the 161
  JPEGs in `public/film/`.

Append `?jump=<scrollY>` to the film for a deterministic single-frame render — it
skips smooth scrolling and paints one frame, which is what makes it verifiable.

## Deployment

Deployed on Vercel as a static Vite site plus the `api/` function (see `vercel.json`).
Set the variables from `.env.example` in the Vercel project settings —
`VITE_TURNSTILE_SITE_KEY` is needed at build time, the rest at runtime. Env var
changes only take effect on a **redeploy**; editing them alone does nothing.

`vercel.json` also sends security headers on every route, including a
Content-Security-Policy: scripts only from this site, Cal.com and Cloudflare
Turnstile, no inline scripts, and frames only for those two embeds. Adding a
third-party script or embed means adding its origin there, or the browser will
block it. `npm run build && CSP_ENFORCE=1 npx vite preview` serves the build
locally under the same headers, enforced, to check a change before it ships.

`vercel.json` sets caching: hashed files in `/assets/` are immutable for a year;
the film frames, hero video, poster and OG image are cached for a week. Those
are not content-hashed, so if you regenerate the frames, write them to a new
folder (e.g. `public/film-v2/`) and update `framePath` in `src/experience/film.ts`,
or returning visitors may see the old ones for up to a week.

Only `VITE_TURNSTILE_SITE_KEY` is public — `VITE_` means "compiled into the
browser bundle", so nothing secret may carry that prefix. The contact function
reads `RESEND_API_KEY` and `TURNSTILE_SECRET_KEY`, both server-only.

## Checks

Three layers, each catching something the others cannot:

- `npm run verify` — type-check, tests, build. This is also `vercel.json`'s
  `buildCommand`, so a failing test fails the deploy.
- `.github/workflows/ci.yml` — the same on every push and pull request.
- `npm run smoke` — runs against a **deployed** URL (production by default).
  `.github/workflows/smoke.yml` fires it automatically when Vercel reports a
  production deployment live.

The smoke check exists because the first two cannot see a deployed artifact that
is broken while the source is fine. The contact endpoint returned 500 for three
refactors: the function runs as ESM under Node, which requires file extensions on
relative imports, and Vite, Vitest and tsc all resolve them without. Green build,
green tests, dead endpoint.

## Tests

`npm test` runs the Vitest suite. The contact endpoint is tested through its
seam — `contact/handler.ts` takes a human check and an inquiry inbox, so the
tests wire the in-memory adapters from `contact/human-check.ts` and
`contact/inquiry-inbox.ts` and reach neither Cloudflare nor Resend. No
network, no credentials, no `vercel dev` required.
