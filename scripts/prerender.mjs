#!/usr/bin/env node
/**
 * Build step 3 of 3: write the server-rendered page into dist/index.html.
 *
 * Step 1 is the browser build; step 2 builds src/entry-server.tsx for Node
 * into dist-ssr/. This imports that bundle, renders the app, and fills the
 * empty root with the result. It fails the build rather than ship an empty
 * page, since that is exactly the failure this step exists to prevent.
 */
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const EMPTY_ROOT = '<div id="root"></div>';

const { render } = await import(join(ROOT, 'dist-ssr/entry-server.js'));
const indexPath = join(ROOT, 'dist/index.html');
const html = readFileSync(indexPath, 'utf8');

if (!html.includes(EMPTY_ROOT)) {
  throw new Error(`prerender: ${EMPTY_ROOT} not found in dist/index.html`);
}

const app = render();
if (!app.includes('id="services"') || !app.includes('id="contact"')) {
  throw new Error('prerender: rendered app is missing its Sections');
}

writeFileSync(indexPath, html.replace(EMPTY_ROOT, `<div id="root">${app}</div>`));
rmSync(join(ROOT, 'dist-ssr'), { recursive: true, force: true });

console.log(`prerender: wrote ${(app.length / 1024).toFixed(1)} KB of HTML into dist/index.html`);
