#!/usr/bin/env node
/**
 * RESPONSIVE + ACCESSIBILITY AUDIT — plan §10.3.
 *
 * Drives a real headless Chromium across every public route at every viewport
 * in the verification matrix and MEASURES the guarantees rather than assuming
 * them. Assumptions are how a site ends up shipping a sideways scrollbar at
 * 320px that nobody noticed.
 *
 * Checks per route × viewport:
 *   · No horizontal overflow  (N20 — the headline guarantee)
 *   · Which element causes it, when it happens
 *   · Tap targets >= 44x44   (§10.2)
 *   · Body text >= 14px      (§10.3)
 *
 * Usage:  node scripts/audit-responsive.mjs [baseUrl]
 * Assumes a server is already running (npm run build && npm run start).
 */

import { chromium } from 'playwright';

const BASE = process.argv[2] ?? 'http://localhost:3210';

/* The matrix from §10.3, plus 128 — the supported floor. */
const VIEWPORTS = [128, 320, 375, 390, 414, 768, 1024, 1280, 1920];

const ROUTES = [
  '/',
  '/work',
  '/about',
  '/blog',
  '/contact',
  '/internship',
  '/privacy',
  '/terms',
  '/legal',
];

/* Runs inside the page. */
function collect() {
  const docWidth = document.documentElement.clientWidth;

  /* ── Horizontal overflow ─────────────────────────────── */
  const all = document.querySelectorAll('body *');

  /* PERFORMANCE — measure first, style second.
     Interleaving getBoundingClientRect() with getComputedStyle() forces a
     style/layout recalculation on every iteration. Across ~770 elements plus
     an ancestor walk that was thousands of forced reflows per page and made a
     full run take longer than ten minutes. Rects are collected in one pass,
     and only the handful of elements that actually overhang are ever styled. */
  const rects = [];
  for (const el of all) {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    rects.push([el, rect]);
  }

  const styleCache = new Map();
  const styleOf = (el) => {
    let s = styleCache.get(el);
    if (!s) {
      s = getComputedStyle(el);
      styleCache.set(el, s);
    }
    return s;
  };

  /**
   * An element clipped by an ancestor cannot widen the document, and neither
   * can one inside a fixed-position subtree. Without this the report is
   * dominated by decorative blobs that are visually clipped and harmless,
   * which buries the element actually causing the overflow.
   */
  const neutralCache = new Map();
  const isNeutralised = (node) => {
    const cached = neutralCache.get(node);
    if (cached !== undefined) return cached;

    const p = node.parentElement;
    let result;
    if (!p || p === document.body) {
      result = false;
    } else {
      const ps = styleOf(p);
      result =
        ps.position === 'fixed' ||
        ps.overflow !== 'visible' ||
        ps.overflowX !== 'visible' ||
        isNeutralised(p); // memoised up the chain
    }
    neutralCache.set(node, result);
    return result;
  };

  const overflowing = [];
  for (const [el, rect] of rects) {
    const overhang = Math.round(rect.right - docWidth);
    if (overhang <= 1) continue;

    const style = styleOf(el);
    if (style.display === 'none' || style.visibility === 'hidden') continue;
    // Elements deliberately allowed to scroll internally are not page overflow.
    if (style.overflowX === 'auto' || style.overflowX === 'scroll') continue;
    if (style.position === 'fixed') continue;
    if (isNeutralised(el)) continue;

    overflowing.push({
      tag: el.tagName.toLowerCase(),
      cls: (el.className?.toString?.() ?? '').slice(0, 70),
      right: Math.round(rect.right),
      overhang,
    });
  }

  /* ── Tap targets ─────────────────────────────────────── */
  const smallTargets = [];
  const interactive = [
    ...document.querySelectorAll(
      'a[href], button, input:not([type="hidden"]), select, textarea, [role="button"]'
    ),
  ].map((el) => [el, el.getBoundingClientRect()]);

  for (const [el, rect] of interactive) {
    if (rect.width === 0 || rect.height === 0) continue;
    if (rect.height >= 44 && rect.width >= 24) continue;

    const style = styleOf(el);
    if (style.display === 'none' || style.visibility === 'hidden') continue;
    // Inline links inside prose are exempt — the WCAG target-size rule
    // explicitly excludes targets in a sentence.
    if (el.tagName === 'A' && style.display === 'inline') continue;
    // Visually-hidden (sr-only) elements have no tap target to measure. The
    // skip link is the canonical case: clipped until focused.
    if (style.clipPath === 'inset(50%)' || style.clip === 'rect(0px, 0px, 0px, 0px)') {
      continue;
    }

    {
      smallTargets.push({
        tag: el.tagName.toLowerCase(),
        text: (el.textContent ?? '').trim().slice(0, 28),
        w: Math.round(rect.width),
        h: Math.round(rect.height),
      });
    }
  }

  /* ── Small text ──────────────────────────────────────── */
  const smallText = [];
  for (const el of document.querySelectorAll('p, li, span, td, dd, label')) {
    if (!el.textContent?.trim()) continue;
    const style = styleOf(el);
    if (style.display === 'none' || style.visibility === 'hidden') continue;
    const size = parseFloat(style.fontSize);
    if (size > 0 && size < 12) {
      smallText.push({
        tag: el.tagName.toLowerCase(),
        size: Math.round(size * 10) / 10,
        text: el.textContent.trim().slice(0, 28),
      });
    }
  }

  return {
    docWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    overflowing: overflowing.slice(0, 6),
    overflowCount: overflowing.length,
    smallTargets: smallTargets.slice(0, 6),
    smallTargetCount: smallTargets.length,
    smallText: smallText.slice(0, 4),
    smallTextCount: smallText.length,
  };
}

const browser = await chromium.launch();

/**
 * A fresh context per route.
 *
 * Reusing one page across 81 viewport changes crashed the renderer partway
 * through — and a crash mid-run silently truncates the results, which is the
 * same failure mode as the HTTP-500 false pass: an incomplete audit that looks
 * finished. Recycling per route keeps memory flat and contains any crash to a
 * single route, which is then reported rather than swallowed.
 */
async function freshPage() {
  const context = await browser.newContext({
    // Cuts animation noise and makes measurements deterministic. It also
    // disables the WebGL particle field via useCapabilities.
    reducedMotion: 'reduce',
  });
  const p = await context.newPage();

  /* Block every off-origin request.
     Layout is determined by our own CSS and DOM; third-party screenshots,
     fonts and Firestore sockets contribute nothing to it and made runs both
     slow and non-deterministic — thum.io alone pushed a full pass past nine
     minutes. Images still reserve their boxes via width/height and `fill`, so
     blocking them does not change geometry. */
  await p.route('**/*', (route) => {
    const url = route.request().url();
    if (url.startsWith(BASE) || url.startsWith('data:') || url.startsWith('blob:')) {
      return route.continue();
    }
    return route.abort();
  });

  return { page: p, context };
}

let failures = 0;
let checks = 0;
const overflowIssues = [];
const badResponses = [];
const tapIssues = new Map();
const textIssues = new Map();

console.log(`\n  Auditing ${BASE}`);
console.log(`  ${ROUTES.length} routes × ${VIEWPORTS.length} viewports\n`);

for (const route of ROUTES) {
  const line = [];
  let { page, context } = await freshPage();

  for (const width of VIEWPORTS) {
    try {
      await page.setViewportSize({ width, height: 900 });
    } catch {
      // Renderer died — rebuild the page and carry on.
      await context.close().catch(() => {});
      ({ page, context } = await freshPage());
      await page.setViewportSize({ width, height: 900 });
    }

    /**
     * STATUS IS ASSERTED BEFORE ANYTHING IS MEASURED.
     *
     * This check exists because its absence produced a completely clean run
     * against a server that was returning HTTP 500 on every route: an error
     * page is 86 bytes, so it trivially has no overflow, no small tap targets
     * and no small text. A green audit against a broken build is worse than no
     * audit, because it is believed.
     */
    /* Neither `networkidle` nor `load` is usable here: Firestore holds a
       long-lived connection open and the WebGL/font subresources keep `load`
       pending, so both burn their full timeout on every navigation.
       `domcontentloaded` + a settle window is what layout measurement
       actually needs — the DOM and CSS are what we measure.

       A navigation failure is RECORDED, never thrown: one slow route must not
       abort the remaining 80 checks. */
    let response;
    try {
      response = await page.goto(`${BASE}${route}`, {
        waitUntil: 'domcontentloaded',
        timeout: 20000,
      });
    } catch (err) {
      failures++;
      checks++;
      line.push(`\x1b[31m${width}⏱\x1b[0m`);
      badResponses.push({
        route,
        width,
        status: 0,
        note: err instanceof Error ? err.message.split('\n')[0] : 'navigation failed',
      });
      continue;
    }
    await page.waitForTimeout(900);

    const status = response?.status() ?? 0;
    if (status !== 200) {
      failures++;
      checks++;
      line.push(`\x1b[31m${width}!\x1b[0m`);
      badResponses.push({ route, width, status });
      continue;
    }

    // A route that rendered nothing cannot be meaningfully audited either.
    let elementCount = 0;
    let r;
    try {
      elementCount = await page.evaluate(
        () => document.querySelectorAll('body *').length
      );
      if (elementCount >= 10) r = await page.evaluate(collect);
    } catch (err) {
      failures++;
      checks++;
      line.push(`\x1b[31m${width}✗\x1b[0m`);
      badResponses.push({
        route,
        width,
        status,
        note: `measurement failed: ${
          err instanceof Error ? err.message.split('\n')[0] : 'unknown'
        }`,
      });
      continue;
    }

    if (elementCount < 10) {
      failures++;
      checks++;
      line.push(`\x1b[31m${width}∅\x1b[0m`);
      badResponses.push({ route, width, status, empty: true, elementCount });
      continue;
    }

    checks++;

    const overflows = r.scrollWidth > r.docWidth + 1;

    if (overflows) {
      failures++;
      line.push(`\x1b[31m${width}✗\x1b[0m`);
      overflowIssues.push({
        route,
        width,
        scrollWidth: r.scrollWidth,
        docWidth: r.docWidth,
        culprits: r.overflowing,
        count: r.overflowCount,
      });
    } else {
      line.push(`\x1b[32m${width}\x1b[0m`);
    }

    if (r.smallTargetCount > 0) {
      const key = `${route}`;
      const prev = tapIssues.get(key);
      if (!prev || r.smallTargetCount > prev.count) {
        tapIssues.set(key, { count: r.smallTargetCount, width, items: r.smallTargets });
      }
    }

    if (r.smallTextCount > 0) {
      const key = `${route}`;
      const prev = textIssues.get(key);
      if (!prev || r.smallTextCount > prev.count) {
        textIssues.set(key, { count: r.smallTextCount, width, items: r.smallText });
      }
    }
  }

  console.log(`  ${route.padEnd(12)} ${line.join(' ')}`);
  await context.close().catch(() => {});
}

await browser.close();

/* ── Report ─────────────────────────────────────────────── */
console.log(`\n  ${'─'.repeat(64)}`);

/* Reported FIRST — every other result is meaningless if this is non-empty. */
if (badResponses.length > 0) {
  console.log(
    `\n  \x1b[31m✗ BAD RESPONSES — ${badResponses.length} page(s) did not render\x1b[0m`
  );
  console.log(
    '    Nothing below can be trusted until these are fixed: an error or empty'
  );
  console.log('    page passes every layout check by default.\n');
  for (const b of badResponses.slice(0, 12)) {
    console.log(
      `    ${b.route} @ ${b.width}px — ${
        b.note ? b.note : `HTTP ${b.status}`
      }${b.empty ? ` (rendered only ${b.elementCount} elements)` : ''}`
    );
  }
  console.log('');
  process.exit(1);
}

if (overflowIssues.length === 0) {
  console.log(`\n  \x1b[32m✓ No horizontal overflow\x1b[0m — ${checks} route/viewport combinations.\n`);
} else {
  console.log(`\n  \x1b[31m✗ HORIZONTAL OVERFLOW — ${overflowIssues.length}/${checks} combinations\x1b[0m\n`);
  for (const issue of overflowIssues) {
    console.log(
      `    ${issue.route} @ ${issue.width}px — scrollWidth ${issue.scrollWidth} vs ${issue.docWidth} (${issue.count} element${issue.count === 1 ? '' : 's'})`
    );
    for (const c of issue.culprits) {
      console.log(`        <${c.tag}> +${c.overhang}px  ${c.cls}`);
    }
  }
  console.log('');
}

if (tapIssues.size === 0) {
  console.log('  \x1b[32m✓ All tap targets >= 44px tall\x1b[0m\n');
} else {
  console.log('  \x1b[33m! Tap targets under 44px\x1b[0m\n');
  for (const [route, info] of tapIssues) {
    console.log(`    ${route} — ${info.count} at ${info.width}px`);
    for (const t of info.items) {
      console.log(`        <${t.tag}> ${t.w}×${t.h}  "${t.text}"`);
    }
  }
  console.log('');
}

if (textIssues.size === 0) {
  console.log('  \x1b[32m✓ No text under 12px\x1b[0m\n');
} else {
  console.log('  \x1b[33m! Text under 12px\x1b[0m\n');
  for (const [route, info] of textIssues) {
    console.log(`    ${route} — ${info.count} at ${info.width}px`);
    for (const t of info.items) {
      console.log(`        <${t.tag}> ${t.size}px  "${t.text}"`);
    }
  }
  console.log('');
}

process.exit(overflowIssues.length > 0 ? 1 : 0);
