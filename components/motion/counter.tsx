'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { useCapabilities } from '@/hooks/use-capabilities';

/**
 * Count-up that fires once on entry, then flashes gold — the legacy
 * two-part effect (main.js:109 counter + vfx.js:571 shimmer) merged into
 * one component so the flash can never desync from the count.
 */
export function Counter({
  value,
  suffix = '',
  prefix = '',
  duration = 1800,
  className,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const { reduced } = useCapabilities();

  const [display, setDisplay] = useState(0);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (!inView) return;

    if (reduced) {
      setDisplay(value);
      return;
    }

    let rafId = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // easeOutExpo — fast then settles, matches the site's motion language
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setDisplay(Math.round(value * eased));

      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setFlash(true);
        setTimeout(() => setFlash(false), 800);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [inView, value, duration, reduced]);

  return (
    <span
      ref={ref}
      className={className}
      style={
        flash
          ? {
              textShadow: '0 0 20px rgba(245,215,110,0.7), 0 0 40px rgba(201,162,39,0.5)',
              filter: 'brightness(1.35)',
              transition: 'text-shadow .3s ease, filter .3s ease',
            }
          : { transition: 'text-shadow .5s ease, filter .5s ease' }
      }
    >
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
