'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import type { BlogPost } from '@/lib/types';
import { BlogCard } from '@/components/blog/blog-card';
import { useCapabilities } from '@/hooks/use-capabilities';
import { cn } from '@/lib/utils';

/**
 * Search + category filtering over posts fetched on the SERVER.
 *
 * The posts arrive as props from a server component, so the article text is in
 * the initial HTML for crawlers; this component only filters what is already
 * there. `useDeferredValue` keeps typing responsive by letting React render the
 * input immediately and the filtered grid at lower priority — the legacy
 * version re-rendered the whole grid synchronously on every keystroke.
 */
export function BlogIndex({ posts }: { posts: BlogPost[] }) {
  const [term, setTerm] = useState('');
  const [category, setCategory] = useState('all');
  const { reduced } = useCapabilities();

  const deferredTerm = useDeferredValue(term);

  const categories = useMemo(() => {
    const set = new Set(posts.map((p) => p.category).filter(Boolean));
    return ['all', ...[...set].sort()];
  }, [posts]);

  const filtered = useMemo(() => {
    const q = deferredTerm.trim().toLowerCase();
    return posts.filter((p) => {
      if (category !== 'all' && p.category !== category) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });
  }, [posts, deferredTerm, category]);

  const isSearching = deferredTerm.trim().length > 0 || category !== 'all';
  const [featured, ...rest] = filtered;

  return (
    <div>
      {/* ── Controls ──────────────────────────────────────── */}
      <div className="mb-12 flex flex-col gap-5">
        <div className="relative mx-auto w-full max-w-md">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30"
          />
          <input
            type="search"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search articles…"
            aria-label="Search articles"
            className="glass w-full rounded-pill py-3 pl-11 pr-11 text-fg placeholder:text-white/30 focus:border-gold/40 focus:outline-none"
          />
          {term && (
            <button
              type="button"
              onClick={() => setTerm('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-white/40 transition-colors hover:text-white"
              style={{ minHeight: 'auto' }}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {categories.length > 2 && (
          <div
            role="tablist"
            aria-label="Filter by category"
            className="flex flex-wrap justify-center gap-2"
          >
            {categories.map((c) => {
              const active = category === c;
              return (
                <button
                  key={c}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setCategory(c)}
                  className={cn(
                    'relative rounded-pill px-4 py-2 font-head text-[11px] font-bold uppercase tracking-[0.14em] transition-colors duration-400',
                    active ? 'text-bg' : 'text-white/45 hover:text-white'
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="blog-category-pill"
                      aria-hidden="true"
                      className="absolute inset-0 -z-10 rounded-pill bg-gradient-gold"
                      transition={
                        reduced ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 34 }
                      }
                    />
                  )}
                  {!active && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 -z-10 rounded-pill border border-gold/15"
                    />
                  )}
                  {c === 'all' ? 'All' : c}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Results ───────────────────────────────────────── */}
      <p className="sr-only" role="status" aria-live="polite">
        {filtered.length} article{filtered.length === 1 ? '' : 's'} found
      </p>

      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-head text-h3 font-bold text-white">Nothing matched</p>
          <p className="mx-auto mt-3 max-w-sm text-fg-60">
            Try a different word, or clear the filters to see everything.
          </p>
          <button
            type="button"
            onClick={() => {
              setTerm('');
              setCategory('all');
            }}
            className="mt-6 inline-flex items-center rounded-pill border border-gold/25 px-6 py-3 font-head text-sm font-bold text-fg-80 transition-colors hover:border-gold/60 hover:text-white"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <motion.div layout={!reduced} className="flex flex-col gap-6">
          {/* Featured-first layout (plan §8.4) — one large, then the grid. */}
          {!isSearching && featured && (
            <BlogCard post={featured} featured priority />
          )}

          <div className="grid grid-cols-1 gap-6 xs:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {(isSearching ? filtered : rest).map((post, i) => (
                <motion.div
                  key={post.id}
                  layout={!reduced}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                  <BlogCard post={post} priority={isSearching && i < 3} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </div>
  );
}
