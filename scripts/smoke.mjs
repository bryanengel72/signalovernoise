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
  return { status: response.status, body: await response.text() };
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

for (const path of ['/', '/experience.html', '/experience']) {
  await check(`GET ${path} serves HTML`, async () => {
    const { status, body } = await get(path);
    assert(status === 200, `expected 200, got ${status}`);
    assert(body.includes('<html'), 'response is not HTML');
  });
}

/* ---------- the build-time substitution actually ran ---------- */

await check('no unsubstituted %TOKEN% reached production', async () => {
  for (const path of ['/', '/experience.html']) {
    const { body } = await get(path);
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
