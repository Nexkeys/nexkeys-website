#!/usr/bin/env node
/**
 * ROUTE GUARD
 *
 * Asserts that the route manifest (lib/data/routes.ts) and the actual pages on
 * disk (app/ ** /page.tsx) describe the same set of URLs.
 *
 * This exists because of a real bug: the navbar and footer linked to /work,
 * /about, /blog, /contact, /privacy, /terms and /legal while NONE of those
 * routes existed. Every link was a 404 and nothing in the toolchain complained
 * — `next build` is perfectly happy to compile a <Link> to nowhere.
 *
 * Run: npm run check:routes
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');

/* ── 1. Declared routes ─────────────────────────────────── */
const manifest = readFileSync(join(root, 'lib/data/routes.ts'), 'utf8');

// Only the href values inside the ROUTES array literal.
const declared = new Set(
  [...manifest.matchAll(/^\s*href:\s*'([^']+)'/gm)].map((m) => m[1])
);

/* Routes in the `system` group (currently /admin) are private: their children
   are intentionally absent from the manifest, the nav and the sitemap, so we
   must not warn about them. Matching is lazy, so each pair belongs to one entry. */
const systemRoots = [
  ...manifest.matchAll(/href:\s*'([^']+)'[\s\S]*?group:\s*'([^']+)'/g),
]
  .filter((m) => m[2] === 'system')
  .map((m) => m[1]);

const isSystemChild = (route) =>
  systemRoots.some((root) => route.startsWith(`${root}/`));

/* ── 2. Routes that actually exist on disk ──────────────── */
const appDir = join(root, 'app');
const onDisk = new Set();

function walk(dir, segments = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (!statSync(full).isDirectory()) {
      if (entry === 'page.tsx' || entry === 'page.ts') {
        onDisk.add('/' + segments.join('/') || '/');
      }
      continue;
    }
    // Private folders (_x) are not routable. Route groups ( x ) do not add a
    // path segment. Dynamic segments ([slug]) cannot be verified statically.
    if (entry.startsWith('_')) continue;
    if (entry.startsWith('(') && entry.endsWith(')')) {
      walk(full, segments);
      continue;
    }
    walk(full, [...segments, entry]);
  }
}
walk(appDir);
onDisk.add('/'); // app/page.tsx normalises to '' above.

const dynamic = [...onDisk].filter((r) => r.includes('['));

/* ── 3. Compare ─────────────────────────────────────────── */
const missingPages = [...declared].filter((r) => !onDisk.has(r));
const unlisted = [...onDisk].filter(
  (r) => !declared.has(r) && !r.includes('[') && !isSystemChild(r)
);

let failed = false;

if (missingPages.length) {
  failed = true;
  console.error('\n  ✗ Declared in routes.ts but NO PAGE EXISTS:');
  console.error('    (these render as 404s wherever they are linked)\n');
  for (const r of missingPages.sort()) {
    console.error(`      ${r}  →  expected app${r === '/' ? '' : r}${sep}page.tsx`);
  }
}

if (unlisted.length) {
  console.warn('\n  ! Page exists but is not in the route manifest:');
  console.warn('    (it will be missing from nav, footer and sitemap.xml)\n');
  for (const r of unlisted.sort()) console.warn(`      ${r}`);
}

if (!failed && !unlisted.length) {
  console.log(
    `\n  ✓ Routes consistent — ${declared.size} declared, ${
      onDisk.size - dynamic.length
    } static pages on disk${
      dynamic.length ? `, ${dynamic.length} dynamic (${dynamic.join(', ')})` : ''
    }.\n`
  );
}

process.exit(failed ? 1 : 0);
