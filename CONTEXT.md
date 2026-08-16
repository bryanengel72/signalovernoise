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

The standalone scroll-film at `/experience` — `public/experience.html`, served raw
with no build step and reachable only from the Navbar. Deliberately outside the
React module graph: its canvas frame-scrubbing engine is load-bearing depth that
does not belong in the bundle.

Its chrome (nav, tokens, fonts, OG tags) and its Copy are currently forked from the
React app and have already drifted. Unifying them is open work, not a settled
decision.
