'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import type { Project } from '@/lib/types';
import { screenshotUrl } from '@/lib/data/projects';
import { cn } from '@/lib/utils';

/**
 * Project card.
 *
 * Uses the LOCAL thumbnail when one exists (plan §3.3) and only falls back
 * to the thum.io proxy otherwise — the legacy site hit thum.io for all 16
 * cards on every render.
 */
export function ProjectCard({ project, priority = false }: { project: Project; priority?: boolean }) {
  const src = project.thumbnail ?? screenshotUrl(project.url);

  /**
   * Remote screenshots bypass the Next image optimizer.
   *
   * `next/image` proxies remote sources through OUR server. thum.io is slow and
   * frequently times out, so every card without a local thumbnail turned into a
   * blocking upstream fetch — observed as `upstream image response timed out`
   * and page loads stalling for a minute. Serving them unoptimized hands the
   * request straight to the browser: our server is never blocked, the image
   * loads lazily, and the designed gradient shows underneath until it arrives
   * (or permanently, if thum.io is down). Local thumbnails are unaffected and
   * still get full optimisation.
   */
  const isRemote = src.startsWith('http');

  return (
    <motion.a
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`View the ${project.name} project (opens in a new tab)`}
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'group relative block aspect-[4/3] overflow-hidden rounded-card border border-gold/12',
        'transition-[border-color,box-shadow] duration-500 hover:border-gold/40 hover:shadow-lift'
      )}
      style={{ background: project.gradient }}
    >
      <Image
        src={src}
        alt=""
        fill
        unoptimized={isRemote}
        loading={priority && !isRemote ? undefined : 'lazy'}
        priority={priority && !isRemote}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover object-top opacity-55 transition-all [transition-duration:900ms] ease-luxe group-hover:scale-[1.07] group-hover:opacity-80"
      />

      {/* Gold veil on hover */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gold/10 opacity-0 mix-blend-overlay transition-opacity duration-500 group-hover:opacity-100"
      />

      {/* Watermark initials */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-5 top-4 font-display text-[68px] leading-none tracking-wide text-gold/[0.14] transition-colors duration-500 group-hover:text-gold/25"
      >
        {project.label}
      </span>

      {project.isLive && (
        <span className="absolute right-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-pill border border-status-live/40 bg-status-live/[0.12] px-3 py-1 font-head text-[10px] font-bold uppercase tracking-[0.14em] text-status-live">
          <span className="h-1.5 w-1.5 animate-live-pulse rounded-full bg-status-live" />
          Live
        </span>
      )}

      {/* Info panel — always readable on touch, slides up on hover */}
      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-bg via-bg/85 to-transparent p-5 pt-16">
        <p className="mb-1.5 font-head text-[10px] font-bold uppercase tracking-[0.14em] text-gold">
          {project.category}
        </p>
        <h3 className="font-head text-base font-bold leading-tight text-white">
          {project.title}
        </h3>

        <span className="mt-3 inline-flex items-center gap-1.5 font-head text-[11px] font-bold uppercase tracking-[0.1em] text-gold-light opacity-0 transition-all duration-500 group-hover:opacity-100 md:translate-y-1 md:group-hover:translate-y-0">
          View Live
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </motion.a>
  );
}
