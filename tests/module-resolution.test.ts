import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = join(__dirname, '..');

/**
 * The serverless function runs as real ESM under Node — package.json declares
 * `"type": "module"` — and Node's ESM resolver requires an explicit file
 * extension on every relative import. Vite, Vitest and tsc all resolve
 * extensionless imports happily, so nothing in the local toolchain notices.
 *
 * It went unnoticed for three refactors: the build succeeded, 199 tests passed,
 * and the deployed function crashed on its first invocation with
 * ERR_MODULE_NOT_FOUND. Nothing had ever executed api/contact.ts's import graph
 * under Node's own resolver.
 *
 * These directories are compiled into the function, so their relative imports
 * must carry `.js` — which TypeScript maps back to the `.ts` source.
 */
const FUNCTION_DIRS = ['api', 'contact', 'content'];

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return walk(full);
    return full.endsWith('.ts') ? [full] : [];
  });

const files = FUNCTION_DIRS.flatMap((dir) => walk(join(ROOT, dir)));

/** Relative specifiers only — bare package names resolve through node_modules. */
const RELATIVE_IMPORT = /(?:from|import)\s+['"](\.\.?\/[^'"]*)['"]/g;

describe('the function graph resolves under Node ESM', () => {
  it('finds modules to check', () => {
    expect(files.length).toBeGreaterThan(10);
  });

  it.each(files.map((f) => relative(ROOT, f)))(
    '%s gives every relative import an extension',
    (rel) => {
      const source = readFileSync(join(ROOT, rel), 'utf8');
      const offenders = [...source.matchAll(RELATIVE_IMPORT)]
        .map((m) => m[1])
        .filter((spec) => !/\.(js|json|css)$/.test(spec));

      expect(offenders).toEqual([]);
    },
  );

  it('package.json still declares ESM, which is what makes this necessary', () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
    expect(pkg.type).toBe('module');
  });
});
