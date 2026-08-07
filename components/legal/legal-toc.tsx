'use client';

import { useEffect, useState } from 'react';
import type { LegalSection } from '@/lib/types';
import { cn } from '@/lib/utils';

/**
 * Sticky table of contents with scroll-spy (plan §8.7).
 *
 * The legacy legal pages were 400+ line walls of text with no navigation at
 * all. On mobile the TOC collapses into a horizontally scrollable strip rather
 * than eating the whole first screen.
 *
 * Uses ONE IntersectionObserver for all sections — not one per heading, and no
 * scroll listener. Observation is passive and off the main thread, so this adds
 * nothing measurable to scroll cost.
 */
export function LegalToc({ sections }: { sections: LegalSection[] }) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? '');

  useEffect(() => {
    const headings = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);

    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // The topmost section currently intersecting wins.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]) setActiveId(visible[0].target.id);
      },
      {
        // Focus the band just below the fixed navbar.
        rootMargin: '-25% 0px -65% 0px',
        threshold: 0,
      }
    );

    headings.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav aria-label="Table of contents" className="lg:sticky lg:top-[calc(var(--nav-h)+32px)]">
      <p className="mb-4 font-head text-[11px] font-bold uppercase tracking-[0.14em] text-white/35">
        Contents
      </p>

      <ul
        className={cn(
          'flex gap-2 overflow-x-auto pb-2 scroll-x',
          'lg:max-h-[70vh] lg:flex-col lg:gap-0.5 lg:overflow-y-auto lg:pb-0'
        )}
      >
        {sections.map((section, i) => {
          const active = activeId === section.id;
          return (
            <li key={section.id} className="shrink-0 lg:shrink">
              <a
                href={`#${section.id}`}
                aria-current={active ? 'location' : undefined}
                className={cn(
                  'flex min-h-11 items-center whitespace-nowrap rounded-lg px-3 py-2 text-[13px] transition-colors duration-300 lg:whitespace-normal',
                  active
                    ? 'bg-gold/10 text-gold'
                    : 'text-white/40 hover:bg-white/[0.03] hover:text-white'
                )}
              >
                <span className="mr-2 font-head text-[11px] font-bold text-gold/50">
                  {section.num || String(i + 1).padStart(2, '0')}
                </span>
                {section.heading}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
