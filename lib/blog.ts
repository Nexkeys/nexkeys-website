import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  type Timestamp,
} from 'firebase/firestore';
import { db, COLLECTIONS } from '@/lib/firebase';
import type { BlogPost, BlogPostDoc } from '@/lib/types';

/**
 * Blog data layer.
 *
 * SECURITY (plan §4.5) — the legacy renderer built markup by string
 * concatenation and assigned it to `innerHTML`, with Firestore values
 * interpolated raw and no escaping anywhere. A post title containing markup
 * executed. Nothing in THIS module produces HTML: it returns typed data, and
 * the components render it as React children, which escape by construction.
 * `dangerouslySetInnerHTML` must never appear in the blog path.
 *
 * SLUGS (plan §4.13) — legacy posts have no `slug` field, because the legacy
 * blog had no URLs: every post opened a modal on `/blog`, so the JSON-LD and
 * meta-tag work in blog.js:479–585 was never visible to a crawler. We derive a
 * stable slug from the title and fall back to the document id, so existing
 * documents get real URLs with no migration.
 */

const FALLBACK_COVERS = [
  '/images/blog/in-house-vs-outsource.png',
  '/images/blog/collaborative-tools.png',
  '/images/blog/retail-experiences.png',
  '/images/blog/fitness-health-apps.png',
  '/images/blog/mobile-team.png',
  '/images/blog/cyrillic-site.png',
];

/** URL-safe slug from a title. Stable for a given title. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip combining diacritics
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
    .replace(/-$/, '');
}

/** ~200 wpm, floor of 1. */
export function readingTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function toDate(value: Timestamp | null | undefined): Date | null {
  if (!value) return null;
  try {
    return value.toDate();
  } catch {
    return null;
  }
}

function normalise(id: string, data: BlogPostDoc, index: number): BlogPost {
  const title = data.title ?? 'Untitled';
  const content = data.content ?? '';

  return {
    id,
    // A stored slug wins; otherwise derive. Falls back to the doc id if the
    // title slugifies to nothing (e.g. a title of only punctuation).
    slug: data.slug?.trim() || slugify(title) || id,
    title,
    summary: data.summary ?? '',
    content,
    category: data.category ?? 'General',
    // Replaces the grey "No Image" data-URI at legacy blog.js:77 with the real
    // cover art already sitting unused in the repo (plan §3.4).
    imageUrl: data.imageUrl?.trim() || FALLBACK_COVERS[index % FALLBACK_COVERS.length],
    createdAt: toDate(data.createdAt),
    readingTime: readingTime(content),
  };
}

export async function listPosts(): Promise<BlogPost[]> {
  try {
    const q = query(collection(db(), COLLECTIONS.blogPosts), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d, i) => normalise(d.id, d.data() as BlogPostDoc, i));
  } catch (err) {
    console.warn('[blog] list failed:', err);
    return [];
  }
}

/**
 * Resolve a post by slug. Falls back to a document-id lookup so any link
 * shared before slugs existed still resolves.
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await listPosts();
  const bySlug = posts.find((p) => p.slug === slug);
  if (bySlug) return bySlug;

  try {
    const snap = await getDoc(doc(db(), COLLECTIONS.blogPosts, slug));
    if (snap.exists()) return normalise(snap.id, snap.data() as BlogPostDoc, 0);
  } catch {
    /* ignore — treated as not found */
  }
  return null;
}

/** Same category first, then most recent. Never includes the current post. */
export function relatedPosts(all: BlogPost[], current: BlogPost, limit = 3): BlogPost[] {
  const others = all.filter((p) => p.id !== current.id);
  const sameCategory = others.filter((p) => p.category === current.category);
  return [...sameCategory, ...others.filter((p) => p.category !== current.category)].slice(
    0,
    limit
  );
}

/**
 * Split raw post content into paragraphs for React rendering.
 * Deliberately NOT a markdown-to-HTML conversion — that would reintroduce the
 * innerHTML path this module exists to avoid.
 */
export function toParagraphs(content: string): string[] {
  return content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function formatPostDate(date: Date | null): string {
  if (!date) return '';
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
