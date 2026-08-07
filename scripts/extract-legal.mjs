#!/usr/bin/env node
/**
 * LEGAL CONTENT EXTRACTOR — one-time migration tool.
 *
 * Converts the legacy privacy.html / terms.html / legal.html documents into a
 * typed content model under lib/data/legal/.
 *
 * WHY A SCRIPT AND NOT HAND-TRANSCRIPTION
 * Plan N1 requires every legal clause to carry over VERBATIM. That is ~1,300
 * lines of dense copy across three documents; transcribing it by hand is
 * exactly the kind of task that silently drops a sentence. Parsing guarantees
 * fidelity and is re-runnable if the source is amended.
 *
 * WHY AN INLINE-NODE MODEL AND NOT HTML STRINGS
 * Emitting HTML strings would force `dangerouslySetInnerHTML` in the renderer,
 * reintroducing the pattern plan §4.5 / N24 exists to remove. Instead each
 * paragraph becomes an array of typed inline nodes that React renders as
 * children — escaped by construction.
 *
 * Run: node scripts/extract-legal.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'node-html-parser';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const legacy = join(root, '..', 'Nexkeys Website');
const outDir = join(root, 'lib', 'data', 'legal');

const DOCS = [
  { file: 'privacy.html', slug: 'privacy', varName: 'PRIVACY' },
  { file: 'terms.html', slug: 'terms', varName: 'TERMS' },
  { file: 'legal.html', slug: 'legal', varName: 'LEGAL' },
];

/* ── Inline nodes ─────────────────────────────────────────
   'text' | {b} bold | {i} italic | {a,href} link | {br} */
function inlineNodes(node) {
  const out = [];

  const walk = (n, fmt = {}) => {
    for (const child of n.childNodes) {
      // Text node
      if (child.nodeType === 3) {
        const text = decode(child.rawText);
        if (!text) continue;
        if (fmt.href) out.push({ t: 'a', text, href: fmt.href });
        else if (fmt.b) out.push({ t: 'b', text });
        else if (fmt.i) out.push({ t: 'i', text });
        else out.push({ t: 's', text });
        continue;
      }

      const tag = child.rawTagName?.toLowerCase();
      if (tag === 'br') {
        out.push({ t: 'br' });
        continue;
      }
      if (tag === 'strong' || tag === 'b') walk(child, { ...fmt, b: true });
      else if (tag === 'em' || tag === 'i') walk(child, { ...fmt, i: true });
      else if (tag === 'a') walk(child, { ...fmt, href: child.getAttribute('href') });
      else walk(child, fmt);
    }
  };

  walk(node);

  // Merge adjacent plain-text runs so the output is compact.
  return out.reduce((acc, cur) => {
    const prev = acc[acc.length - 1];
    if (prev && prev.t === 's' && cur.t === 's') prev.text += cur.text;
    else acc.push(cur);
    return acc;
  }, []);
}

function decode(raw) {
  return raw
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, '’')
    .replace(/&lsquo;/g, '‘')
    .replace(/&ldquo;/g, '“')
    .replace(/&rdquo;/g, '”')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&hellip;/g, '…')
    .replace(/&#x1F3E2;/g, '\u{1F3E2}')
    .replace(/&#x2709;/g, '✉')
    .replace(/&#x[0-9A-Fa-f]+;/g, (m) =>
      String.fromCodePoint(parseInt(m.slice(3, -1), 16))
    )
    .replace(/\s+/g, ' ')
    .trim();
}

function plain(node) {
  return decode(node.text ?? '');
}

/* ── Block conversion ─────────────────────────────────── */
function toBlocks(container) {
  const blocks = [];

  for (const el of container.childNodes) {
    if (el.nodeType !== 1) continue;
    const tag = el.rawTagName?.toLowerCase();
    const cls = el.getAttribute('class') ?? '';

    if (tag === 'h3') {
      blocks.push({ type: 'h3', text: plain(el) });
    } else if (tag === 'h4') {
      blocks.push({ type: 'h4', text: plain(el) });
    } else if (tag === 'p') {
      const nodes = inlineNodes(el);
      if (nodes.length) blocks.push({ type: 'p', nodes });
    } else if (tag === 'ul' || tag === 'ol') {
      const items = el
        .querySelectorAll(':scope > li')
        .map((li) => inlineNodes(li))
        .filter((n) => n.length);
      if (items.length) blocks.push({ type: tag, items });
    } else if (cls.includes('legal-callout')) {
      blocks.push({ type: 'callout', blocks: toBlocks(el) });
    } else if (cls.includes('legal-contact-card')) {
      const rows = el.querySelectorAll('.legal-contact-row').map((row) => ({
        icon: plain(row.querySelector('.legal-contact-icon') ?? { text: '' }),
        nodes: inlineNodes(
          row.querySelectorAll('div').filter((d) => !(d.getAttribute('class') ?? '').includes('icon')).pop() ?? row
        ),
      }));
      blocks.push({ type: 'contactCard', rows });
    } else if (cls.includes('legal-table-wrap') || tag === 'table') {
      const table = tag === 'table' ? el : el.querySelector('table');
      if (!table) continue;
      const head = table.querySelectorAll('thead th').map((th) => plain(th));
      const rows = table
        .querySelectorAll('tbody tr')
        .map((tr) => tr.querySelectorAll('td').map((td) => plain(td)));
      blocks.push({ type: 'table', head, rows });
    } else if (tag === 'div' || tag === 'section') {
      // Unknown wrapper — descend so nothing is lost.
      blocks.push(...toBlocks(el));
    }
  }

  return blocks;
}

/* ── Per-document extraction ──────────────────────────── */
function extract({ file, slug }) {
  const html = readFileSync(join(legacy, file), 'utf8');
  const doc = parse(html);

  const h1 = doc.querySelector('h1');
  const title = plain(h1);

  // The intro paragraph is the <p> immediately following the <h1>.
  const introEl = h1?.parentNode?.querySelector('p');
  const intro = introEl ? plain(introEl) : '';

  const meta = doc.querySelectorAll('.legal-meta-item').map((item) => ({
    label: plain(item.querySelector('.legal-meta-label') ?? { text: '' }),
    value: plain(item.querySelector('.legal-meta-val') ?? { text: '' }),
  }));

  const sections = doc.querySelectorAll('.legal-doc > section').map((sec) => {
    const h2 = sec.querySelector('h2');
    const numEl = h2?.querySelector('.sec-num');
    const num = numEl ? plain(numEl) : '';

    // Heading text without the leading section number.
    let heading = plain(h2);
    if (num && heading.startsWith(num)) heading = heading.slice(num.length).trim();

    // Remove the h2 before collecting the body so it is not duplicated.
    h2?.remove();

    return { id: sec.getAttribute('id') ?? '', num, heading, blocks: toBlocks(sec) };
  });

  return { slug, title, intro, meta, sections };
}

/* ── Emit ─────────────────────────────────────────────── */
mkdirSync(outDir, { recursive: true });

const summary = [];

for (const def of DOCS) {
  const data = extract(def);

  const blockCount = data.sections.reduce((n, s) => n + s.blocks.length, 0);
  summary.push(
    `${def.slug}: ${data.sections.length} sections, ${blockCount} blocks, ${data.meta.length} meta`
  );

  const body = `// GENERATED by scripts/extract-legal.mjs — do not edit by hand.
// Source: ../../../../Nexkeys Website/${def.file}
// Legal copy is preserved verbatim (plan N1). Re-run the script if the
// source document is amended.

import type { LegalDocument } from '@/lib/types';

export const ${def.varName}: LegalDocument = ${JSON.stringify(data, null, 2)};
`;

  writeFileSync(join(outDir, `${def.slug}.ts`), body, 'utf8');
}

console.log('\n  ✓ Legal content extracted\n');
for (const line of summary) console.log(`      ${line}`);
console.log('');
