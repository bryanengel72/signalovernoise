# Signal Over Noise AI

Marketing site for [Signal Over Noise AI](https://www.signalovernoiseai.com) — AI automation consulting for mid-market B2B.

Built with React 19, Vite, Tailwind CSS 4, and Motion. Contact form submissions are stored in Supabase; discovery-call booking is handled by a Cal.com embed.

## Run locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```
   npm install
   ```
2. Create `.env.local` with the Supabase credentials (used by the contact form):
   ```
   VITE_SUPABASE_URL=<project url>
   VITE_SUPABASE_ANON_KEY=<anon key>
   ```
3. Start the dev server:
   ```
   npm run dev
   ```

## Scripts

- `npm run dev` — dev server on port 3000
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the production build locally
- `npm run lint` — type-check with `tsc --noEmit`

## Deployment

Deployed on Vercel as a static Vite site (see `vercel.json`). Set the `VITE_SUPABASE_*` environment variables in the Vercel project settings.
