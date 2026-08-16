# Domain language

The names this codebase uses for the things it deals with. Reach for these terms in
module names, types, and commit messages before inventing new ones.

## Inquiry

A contact-form submission: name, email, company, message. Created in the browser,
carried across the network seam by `POST /api/contact`, and stored in the
`booking_inquiries` table once Cloudflare Turnstile confirms a human sent it.

Defined once, in `contact/inquiry.ts`, along with the rules it must satisfy. Both
sides import them — the browser to skip a pointless round-trip, the function
because a client-side check is not a gate.

An Inquiry is only ever written server-side. `supabase/lockdown.sql` revokes all
privileges from the `anon` role — that revocation is what makes the Turnstile gate
non-bypassable, and it is the invariant the whole contact path rests on.

## HumanCheck

The seam in front of Cloudflare Turnstile: given a token and a caller address, it
answers whether a human solved the challenge. Two adapters — Turnstile in
production, a stub in tests.

## InquiryStore

The seam in front of Supabase: it saves an Inquiry and says whether that worked.
Two adapters — the service-role Supabase write in production, an in-memory array
in tests.

Together with HumanCheck, this is what lets the whole contact path be exercised
without a network. `api/contact.ts` is now only a composition root: it chooses
the production adapters and hands them to `contact/handler.ts`.

## Section

One full-width band of the marketing page: Problem, Services, Efficiency, Process,
About, Contact. A Section is presentation only — it lays out Copy it is given and
holds none of its own.

Lives in `src/components/sections/`.

## Copy

The words and numbers a Section renders. Owned by the `content/` modules, never by
the Section that displays it.

Copy is framework-free by construction: it is compiled twice, once by Vite into the
browser bundle and once by Vercel into the serverless function, so it must not
import React, JSX, or `import.meta.env`.

## Identity

The consultancy's contact facts — email address, Cal.com booking slug, response-time
promise. Referenced from both sides of the network seam and from both pages, so it
lives in `content/identity.ts` rather than in any module that renders it.

Before this was extracted, the email address appeared at ten sites across six
modules, and one of them was misspelled.

## Message

A user-facing string the contact endpoint returns and the browser renders verbatim.
Messages are Copy that happens to travel across the network seam, so they live in
`content/messages.ts` and are imported by `api/contact.ts` rather than written
inline there.

## Experience

The scroll-film at `/experience.html` — a second Vite build entry, reachable from
the Navbar. Deliberately not React: its canvas frame-scrubbing engine
(`src/experience/film.ts`) runs a 161-frame ImageBitmap sliding window so every
scroll draw is a pure blit, and that earns its own runtime.

It is in the module graph now. Its Copy lives in `content/sections/experience.ts`
and is substituted into the markup at build time by the `experience-content`
plugin, so the page stays static HTML in the output. Identity is not duplicated
there — the booking slug and address come from the same place as everywhere else.

Its Copy is deliberately *not* the site's: the film says "99% faster" where the
site says "99% time reduction", and runs four delta rows to the site's five.
Shorter reads better against moving footage. That divergence is art direction,
not drift.

What it still keeps of its own: the CSS, including a hand-maintained copy of the
theme tokens. It has no Tailwind, so it cannot consume the `@theme` block;
`tests/theme.test.ts` fails if the two ever disagree.
