'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import { useCapabilities } from '@/hooks/use-capabilities';

/**
 * Lenis smooth scroll.
 *
 * Two things the legacy setup got wrong and this fixes:
 *  1. App Router route changes left Lenis holding the old scroll position —
 *     we reset to top on every pathname change.
 *  2. It ran even under prefers-reduced-motion. It no longer does.
 *
 * TUNING — calm, but never laggy.
 * `lerp` is used instead of `duration`. A duration-based tween commits to a
 * fixed travel time, so the page keeps gliding after the wheel stops — that
 * is precisely the "delayed / slow" feeling we do not want. A lerp is
 * frame-rate independent and always chasing the CURRENT target, so it tracks
 * input immediately and still settles smoothly. 0.12 reads as weighted and
 * expensive; below ~0.08 it starts to feel like drag.
 *
 * Touch is deliberately left NATIVE (no `syncTouch`). Native momentum on iOS
 * and Android is GPU-driven and beats anything we can run in JS — hijacking
 * it is the single most common cause of a site "feeling slow" on mobile.
 */
export function LenisProvider({ children }: { children: React.ReactNode }) {
  const { reduced, ready } = useCapabilities();
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!ready || reduced) return;

    const lenis = new Lenis({
      lerp: 0.12,
      smoothWheel: true,
      wheelMultiplier: 1,
      infinite: false,
    });

    lenisRef.current = lenis;

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [ready, reduced]);

  // Reset scroll on navigation — App Router does not do this for us with Lenis.
  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
  }, [pathname]);

  return <>{children}</>;
}
