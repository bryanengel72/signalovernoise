#!/usr/bin/env node
/**
 * Post-deploy smoke check.
 *
 * Everything the local toolchain can prove, it already proves: 224 tests, a
 * type-check, and a build that all run before a deploy is allowed. This exists
 * for the class of failure none of them can see — where the code is correct but
 * the *deployed artifact* is not.
 *
 * That is not hypothetical. The contact endpoint returned 500
 * FUNCTION_INVOCATION_FAILED for three refactors because the function runs as
 * real ESM under Node, which needs file extensions on relative imports, while
 * Vite, Vitest and tsc are all happy without them. Green build, green tests,
 * dead endpoint. The first assertion below is the one that would have caught it
 * within a minute.
 *
 * Usage: node scripts/smoke.mjs [baseUrl]
 */

const base = (process.argv[2] || 'https://www.signalovernoiseai.com').replace(/\/$/, '');

const results = [];
const check = async (name, fn) => {
  try {
    await fn();
    results.push({ name, ok: true });
  } catch (error) {
    results.push({ name, ok: false, detail: error.message });
  }
};

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const get = async (path) => {
  const response = await fetch(base + path, { redirect: 'follow' });
  const body = await response.text();

  // A protected deployment answers 401 with a perfectly valid HTML auth page,
  // which will satisfy any assertion loose enough to just look for markup. Fail
  // loudly instead of quietly checking Vercel's login screen.
  if (response.status === 401 || body.includes('Protected deployment')) {
    throw new Error(
      `${base} is behind deployment protection — smoke the production alias, not a deployment URL`,
    );
  }

  return { status: response.status, body };
};

const postContact = (payload) =>
  fetch(base + '/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });

const inquiry = {
  name: 'Smoke Check',
  email: 'smoke@example.com',
  message: 'Automated post-deploy check.',
  website: '',
  turnstileToken: '',
};

/* ---------- the function actually boots ---------- */

// The regression this file exists for. A module-resolution failure surfaces as
// a 500 FUNCTION_INVOCATION_FAILED before any of the handler's logic runs, so a
// well-formed rejection is proof the whole import graph loaded under Node.
await check('POST /api/contact rejects a missing human check with 400', async () => {
  const response = await postContact(inquiry);
  const text = await response.text();

  assert(
    response.status !== 401,
    `${base} is behind deployment protection — smoke the production alias, not a deployment URL`,
  );
  assert(
    response.status !== 500,
    `function failed to invoke — HTTP 500: ${text.slice(0, 160)}`,
  );
  assert(response.status === 400, `expected 400, got ${response.status}: ${text.slice(0, 160)}`);

  const body = JSON.parse(text);
  assert(typeof body.error === 'string' && body.error.length > 0, 'no error message in body');
});

// The honeypot short-circuits before Turnstile and before any write, so this
// exercises more of the handler without creating an Inquiry.
await check('POST /api/contact swallows a filled honeypot', async () => {
  const response = await postContact({ ...inquiry, website: 'http://spam.example' });
  const body = JSON.parse(await response.text());

  assert(response.status === 200, `expected 200, got ${response.status}`);
  assert(body.ok === true, 'honeypot submission was not accepted silently');
});

/* ---------- the pages are served ---------- */

// Each marker is something only the real page has, so a protection page, an
// error page or a stale placeholder cannot satisfy it.
const PAGES = [
  ['/', 'id="root"'],
  ['/', 'Signal Over Noise'],
  ['/experience.html', 'id="film-canvas"'],
  ['/experience', 'id="film-canvas"'],
];

for (const [path, marker] of PAGES) {
  await check(`GET ${path} serves the real page (${marker})`, async () => {
    const { status, body } = await get(path);
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.includes(marker), `page did not contain ${JSON.stringify(marker)}`);
  });
}

/* ---------- the build-time substitution actually ran ---------- */

await check('no unsubstituted %TOKEN% reached production', async () => {
  for (const [path, marker] of [['/', 'id="root"'], ['/experience.html', 'id="film-canvas"']]) {
    const { body } = await get(path);
    // Without this the check passes vacuously on any page that happens to have
    // no tokens in it — an auth page, an error page, anything at all.
    assert(body.includes(marker), `${path} is not the real page, so this proves nothing`);

    const leftover = body.match(/%[A-Z_]{3,}%/g);
    assert(!leftover, `${path} still contains ${leftover?.join(', ')}`);
  }
});

await check('the scroll-film ships a telemetry seed, not a placeholder', async () => {
  const { body } = await get('/experience.html');
  const seed = body.match(/id="snr">([^<]*)</)?.[1];
  assert(seed, 'no telemetry seed found');
  assert(/^[+−-]\d+\.\d+ dB$/.test(seed), `seed looks wrong: ${JSON.stringify(seed)}`);
});

/* ---------- report ---------- */

const failed = results.filter((r) => !r.ok);
for (const r of results) {
  console.log(`${r.ok ? '✓' : '✗'} ${r.name}${r.ok ? '' : `\n    ${r.detail}`}`);
}
console.log(`\n${results.length - failed.length}/${results.length} passed against ${base}`);

if (failed.length) process.exit(1);
