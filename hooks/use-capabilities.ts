'use client';

import { useEffect, useState } from 'react';

export interface Capabilities {
  /** Touch input present. */
  isTouch: boolean;
  /** Touch OR narrow viewport — heavy effects off. */
  isMobile: boolean;
  /** Viewport is below the `xs` (400px) rail — ultra-compact layout. */
  isTiny: boolean;
  /** User asked for reduced motion. */
  reduced: boolean;
  /** <= 2 logical cores. */
  lowPower: boolean;
  /** Safe to run WebGL / continuous RAF work. */
  canHeavy: boolean;
  /** Fine pointer — safe to hide the native cursor. */
  finePointer: boolean;
  /** True after mount; guards SSR/hydration mismatch. */
  ready: boolean;
}

const INITIAL: Capabilities = {
  isTouch: false,
  isMobile: false,
  isTiny: false,
  reduced: false,
  lowPower: false,
  canHeavy: false,
  finePointer: false,
  ready: false,
};

/** Cheap structural compare — lets us bail before triggering a re-render. */
function same(a: Capabilities, b: Capabilities): boolean {
  return (
    a.isTouch === b.isTouch &&
    a.isMobile === b.isMobile &&
    a.isTiny === b.isTiny &&
    a.reduced === b.reduced &&
    a.lowPower === b.lowPower &&
    a.canHeavy === b.canHeavy &&
    a.finePointer === b.finePointer &&
    a.ready === b.ready
  );
}

/**
 * Ports the legacy device gating from vfx.js:31–35 into a typed hook.
 * Everything expensive in this codebase asks this hook first.
 *
 * PERFORMANCE — three deliberate guards, because this hook is consumed by
 * almost every animated component and a naive version re-renders the whole
 * tree mid-scroll:
 *
 *  1. WIDTH-ONLY. Mobile browsers fire `resize` continuously while the URL
 *     bar collapses on scroll. That changes only the HEIGHT. We ignore it
 *     and recompute solely when the WIDTH actually changes.
 *  2. DEBOUNCED. Desktop drag-resize fires a burst of events; we settle once.
 *  3. STRUCTURALLY COMPARED. Even after recomputing we return the PREVIOUS
 *     object when nothing meaningful changed, so `useEffect` dependencies
 *     stay referentially stable and consumers do not re-render at all.
 */
export function useCapabilities(): Capabilities {
  const [caps, setCaps] = useState<Capabilities>(INITIAL);

  useEffect(() => {
    const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointerQuery = window.matchMedia('(pointer: fine)');

    const compute = (): Capabilities => {
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const width = window.innerWidth;
      const isMobile = isTouch || width < 768;
      const reduced = reducedQuery.matches;
      const lowPower =
        navigator.hardwareConcurrency !== undefined &&
        navigator.hardwareConcurrency <= 2;
      const finePointer = pointerQuery.matches;

      return {
        isTouch,
        isMobile,
        isTiny: width < 400,
        reduced,
        lowPower,
        finePointer,
        canHeavy: !isMobile && !reduced && !lowPower,
        ready: true,
      };
    };

    // Commit only when something actually differs.
    const apply = () => setCaps((prev) => {
      const next = compute();
      return same(prev, next) ? prev : next;
    });

    apply();

    let lastWidth = window.innerWidth;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const onResize = () => {
      // Guard 1 — height-only change (mobile URL bar). Do nothing.
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;

      // Guard 2 — debounce the burst.
      clearTimeout(timer);
      timer = setTimeout(apply, 150);
    };

    reducedQuery.addEventListener('change', apply);
    pointerQuery.addEventListener('change', apply);
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      clearTimeout(timer);
      reducedQuery.removeEventListener('change', apply);
      pointerQuery.removeEventListener('change', apply);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return caps;
}
