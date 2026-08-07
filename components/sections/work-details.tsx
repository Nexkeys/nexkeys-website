'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

import type { Project, WorkDetail } from '@/lib/types';
import { screenshotUrl } from '@/lib/data/projects';
import { Reveal } from '@/components/motion/reveal';
import { useCapabilities } from '@/hooks/use-capabilities';
import { cn } from '@/lib/utils';

/**
 * The long-form project write-ups (plan §8.2).
 *
 * Copy is ported verbatim from legacy work.html by
 * scripts/extract-work-details.mjs — 16 entries, ~1,600 words that the first
 * pass of this rebuild dropped entirely.
 *
 * Rows alternate side and the visual parallaxes gently as the text scrolls, so
 * the page reads as a sequence rather than a wall.
 */
function DetailRow({
  detail,
  project,
  flip,
}: {
  detail: WorkDetail;
  project?: Project;
  flip: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const { reduced } = useCapabilities();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  // Small, slow drift — cinematic without drawing attention to itself.
  const y = useTransform(scrollYProgress, [0, 1], ['6%', '-6%']);

  const thumbnail = project?.thumbnail ?? (project ? screenshotUrl(project.url) : null);
  const isRemote = !!thumbnail && thumbnail.startsWith('http');

  return (
    <article
      ref={ref}
      aria-labelledby={`detail-${detail.id}`}
      className="grid grid-cols-1 items-center gap-8 py-section-sm lg:grid-cols-2 lg:gap-16"
    >
      {/* ── Copy ─────────────────────────────────────────── */}
      <div className={cn('min-w-0', flip && 'lg:order-2')}>
        <Reveal>
          <span
            aria-hidden="true"
            className="font-display text-[clamp(min(48px,16vw),5vw,72px)] leading-none text-gold/20"
          >
            {detail.index}
          </span>
        </Reveal>

        <Reveal delay={0.06}>
          <h3
            id={`detail-${detail.id}`}
            className="mt-3 font-head text-h2 font-bold text-white"
          >
            {detail.name}
          </h3>
        </Reveal>

        <Reveal delay={0.12}>
          <ul className="mt-5 flex flex-wrap gap-2">
            {detail.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-pill border border-gold/20 px-3 py-1 font-head text-[10px] font-bold uppercase tracking-[0.12em] text-gold"
              >
                {tag}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.18}>
          <div className="mt-6 measure">
            {detail.paragraphs.map((para, i) => (
              <p key={i} className="mb-4 text-[15px] leading-[1.85] text-fg-60">
                {para}
              </p>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.24}>
          <a
            href={detail.url}
            target="_blank"
            rel="noopener noreferrer"
            data-tap
            className="group mt-4 inline-flex min-h-11 items-center gap-2 font-head text-[12px] font-bold uppercase tracking-[0.12em] text-gold transition-all duration-500 hover:gap-3.5 hover:text-gold-light"
          >
            View Live Project
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </Reveal>
      </div>

      {/* ── Visual ───────────────────────────────────────── */}
      <Reveal
        direction="none"
        delay={0.1}
        className={cn('min-w-0', flip && 'lg:order-1')}
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-card border border-gold/12">
          <motion.div
            style={reduced ? undefined : { y }}
            className="absolute inset-[-6%]"
          >
            {thumbnail ? (
              <Image
                src={thumbnail}
                alt=""
                fill
                unoptimized={isRemote}
                loading="lazy"
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-top opacity-60"
              />
            ) : (
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{ background: project?.gradient }}
              />
            )}
          </motion.div>

          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/85 via-transparent to-transparent"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-4 left-5 font-display text-[52px] leading-none text-gold/25"
          >
            {detail.label}
          </span>
        </div>
      </Reveal>
    </article>
  );
}

export function WorkDetails({
  details,
  projects,
}: {
  details: WorkDetail[];
  projects: Project[];
}) {
  const byId = new Map(projects.map((p) => [p.id, p]));

  return (
    <div className="divide-y divide-gold/8">
      {details.map((detail, i) => (
        <DetailRow
          key={detail.id}
          detail={detail}
          project={byId.get(detail.id)}
          flip={i % 2 === 1}
        />
      ))}
    </div>
  );
}
