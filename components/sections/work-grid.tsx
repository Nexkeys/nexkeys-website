'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Project, ProjectCategory } from '@/lib/types';
import { WORK_FILTERS } from '@/lib/data/projects';
import { ProjectCard } from '@/components/sections/project-card';
import { useCapabilities } from '@/hooks/use-capabilities';
import { cn } from '@/lib/utils';

type FilterId = (typeof WORK_FILTERS)[number]['id'];

const PAGE_SIZE = 9;

/**
 * The work grid and its filters.
 *
 * FIXES PLAN §4.2 — the legacy bug worth understanding, because it is the
 * reason this component is shaped the way it is:
 *
 *   `work.js` rebuilt the filter buttons from Firestore with innerHTML, which
 *   destroyed the click handlers `main.js` had bound inline. Filtering then
 *   died SILENTLY — and only in production, only once the CMS had content.
 *   The admin panel could break the public site just by saving.
 *
 * Here the filter list is derived state and the handlers are bound by React,
 * so there is no DOM to rebuild and nothing to un-bind. Whatever the CMS
 * returns, the filters keep working.
 *
 * Re-flow uses `layout` + `AnimatePresence` rather than the legacy
 * opacity-dim trick, so cards physically travel to their new positions.
 */
export function WorkGrid({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState<FilterId>('all');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const { reduced } = useCapabilities();

  const filtered = useMemo(() => {
    if (active === 'all') return projects;
    return projects.filter((p) =>
      p.categories.includes(active as ProjectCategory)
    );
  }, [projects, active]);

  const shown = filtered.slice(0, visible);
  const hasMore = filtered.length > visible;

  const onFilter = (id: FilterId) => {
    setActive(id);
    setVisible(PAGE_SIZE); // Reset paging so a filter never opens mid-list.
  };

  return (
    <div>
      {/* ── Filters ───────────────────────────────────────── */}
      <div
        role="tablist"
        aria-label="Filter projects by category"
        className="mb-10 flex flex-wrap justify-center gap-2 sm:gap-2.5"
      >
        {WORK_FILTERS.map((f) => {
          const isActive = active === f.id;
          return (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onFilter(f.id)}
              className={cn(
                'relative rounded-pill px-4 py-2.5 font-head text-[11px] font-bold uppercase tracking-[0.14em] transition-colors duration-400 sm:px-5',
                /* 44px min tap target comes from the global button rule. */
                isActive ? 'text-bg' : 'text-white/45 hover:text-white'
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="work-filter-pill"
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 rounded-pill bg-gradient-gold"
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 380, damping: 34 }
                  }
                />
              )}
              {!isActive && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 rounded-pill border border-gold/15"
                />
              )}
              {f.label}
            </button>
          );
        })}
      </div>

      {/* ── Grid ──────────────────────────────────────────── */}
      <motion.div
        layout={!reduced}
        className="grid grid-cols-1 gap-5 xs:grid-cols-2 lg:grid-cols-3"
      >
        <AnimatePresence mode="popLayout">
          {shown.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              priority={i < 3}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty state — reachable if the CMS filters everything out. */}
      {shown.length === 0 && (
        <p className="py-16 text-center text-body-lg text-fg-40">
          No projects in this category yet.
        </p>
      )}

      {hasMore && (
        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="sheen inline-flex items-center rounded-pill border border-gold/25 px-7 py-3 font-head text-sm font-bold text-fg-80 transition-colors duration-500 ease-luxe hover:border-gold/60 hover:text-white"
          >
            Load more
            <span className="ml-2 text-gold">
              ({filtered.length - visible})
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
