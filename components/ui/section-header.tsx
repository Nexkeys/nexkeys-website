import type { ReactNode } from 'react';
import { Reveal } from '@/components/motion/reveal';
import { cn } from '@/lib/utils';

/**
 * Shared section header. The generous bottom margin is deliberate — the
 * whole redesign leans on whitespace to feel premium (plan §1, findrealestate
 * reference). Do not tighten these without a reason.
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
}) {
  const centered = align === 'center';

  return (
    <div
      className={cn(
        'mb-14 md:mb-20',
        centered && 'flex flex-col items-center text-center',
        className
      )}
    >
      <Reveal>
        <p className="eyebrow">{eyebrow}</p>
      </Reveal>

      <Reveal delay={0.08}>
        <h2 className="mt-5 font-head text-h2 font-bold">{title}</h2>
      </Reveal>

      {description && (
        <Reveal delay={0.16}>
          <p
            className={cn(
              'mt-5 max-w-xl text-body-lg font-light text-fg-60',
              centered && 'mx-auto'
            )}
          >
            {description}
          </p>
        </Reveal>
      )}
    </div>
  );
}
