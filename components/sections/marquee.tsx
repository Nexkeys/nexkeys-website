import { TECH_MARQUEE } from '@/lib/data/services';

/**
 * Infinite tech strip. The list is rendered twice — the second copy is
 * aria-hidden so screen readers hear each technology once, while the
 * -50% translate keeps the loop seamless.
 */
export function Marquee() {
  return (
    <div
      className="relative overflow-hidden border-y border-gold/12 bg-bg-2 py-6"
      aria-label="Technologies we use"
    >
      {/* Edge fades so items dissolve rather than clip */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-bg-2 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-bg-2 to-transparent" />

      <div className="group flex w-max animate-marquee items-center gap-14 hover:[animation-play-state:paused] motion-reduce:animate-none">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center gap-14" aria-hidden={copy === 1}>
            {TECH_MARQUEE.map((tech) => (
              <span
                key={`${copy}-${tech}`}
                className="flex shrink-0 items-center gap-2.5 whitespace-nowrap font-head text-sm font-bold tracking-wide text-white/30 transition-colors duration-300 hover:text-fg-60"
              >
                <span className="h-1 w-1 shrink-0 rotate-45 bg-gold" />
                {tech}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
