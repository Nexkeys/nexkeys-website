'use client';

import { useEffect, useRef, useState } from 'react';
import { useCapabilities } from '@/hooks/use-capabilities';

/**
 * Custom cursor — gold dot + trailing ring + a soft ambient halo.
 *
 * Fixes plan §4.10: the legacy site set `cursor:none` globally in CSS, so a
 * JS failure left users with NO cursor at all. Here the class that hides the
 * native cursor is added by this component only once it has actually mounted
 * and confirmed a fine pointer — and it is removed on unmount.
 */
export function CustomCursor() {
  const { finePointer, reduced, canHeavy, ready, isTouch, lowPower } = useCapabilities();
  const [enabled, setEnabled] = useState(false);

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ready) return;
    setEnabled(finePointer && !reduced && !isTouch && !lowPower && canHeavy);
  }, [ready, finePointer, reduced, isTouch, lowPower, canHeavy]);

  useEffect(() => {
    if (!enabled) return;

    document.body.classList.add('nk-cursor-active');

    let mx = -300;
    let my = -300;
    let rx = mx;
    let ry = my;
    let hx = mx;
    let hy = my;
    let rafId = 0;
    let running = false;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      // The DOT is written synchronously from the event — never lerped, never
      // deferred to rAF. This is what makes the cursor feel instant; a pointer
      // that trails its own input is the fastest way to make a site feel slow.
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      }
      start();
    };

    /* Delegated hover detection.
       The previous version attached two listeners to every interactive node
       found at mount — hundreds of listeners, and completely blind to anything
       rendered later (route changes, modals, filtered cards). One listener on
       the document handles all of it, forever, at lower cost. */
    const INTERACTIVE =
      'a, button, [role="button"], input, textarea, select, [data-cursor="hover"]';

    const onOver = (e: MouseEvent) => {
      if ((e.target as Element)?.closest?.(INTERACTIVE)) {
        document.body.classList.add('nk-cursor-hover');
      }
    };
    const onOut = (e: MouseEvent) => {
      if ((e.target as Element)?.closest?.(INTERACTIVE)) {
        document.body.classList.remove('nk-cursor-hover');
      }
    };

    const onDocLeave = () => {
      if (dotRef.current) dotRef.current.style.opacity = '0';
      if (ringRef.current) ringRef.current.style.opacity = '0';
      if (haloRef.current) haloRef.current.style.opacity = '0';
    };
    const onDocEnter = () => {
      if (dotRef.current) dotRef.current.style.opacity = '1';
      if (ringRef.current) ringRef.current.style.opacity = '1';
      if (haloRef.current) haloRef.current.style.opacity = '1';
    };

    const tick = () => {
      rx += (mx - rx) * 0.14;
      ry += (my - ry) * 0.14;
      hx += (mx - hx) * 0.045;
      hy += (my - hy) * 0.045;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      }
      if (haloRef.current) {
        haloRef.current.style.transform = `translate3d(${hx - 300}px, ${hy - 300}px, 0)`;
      }

      // Park the loop once the trail has caught up. An always-on 60fps rAF
      // costs battery and competes with Lenis for frame budget while the user
      // is just reading. `onMove` restarts it instantly.
      if (Math.abs(mx - rx) < 0.2 && Math.abs(my - ry) < 0.2 &&
          Math.abs(mx - hx) < 0.5 && Math.abs(my - hy) < 0.5) {
        running = false;
        return;
      }
      rafId = requestAnimationFrame(tick);
    };

    function start() {
      if (running) return;
      running = true;
      rafId = requestAnimationFrame(tick);
    }
    start();

    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onDocLeave);
    document.addEventListener('mouseenter', onDocEnter);
    document.addEventListener('mouseover', onOver, { passive: true });
    document.addEventListener('mouseout', onOut, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      running = false;
      document.body.classList.remove('nk-cursor-active', 'nk-cursor-hover');
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onDocLeave);
      document.removeEventListener('mouseenter', onDocEnter);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      {canHeavy && (
        <div
          ref={haloRef}
          aria-hidden="true"
          className="pointer-events-none fixed left-0 top-0 z-0 h-[600px] w-[600px] rounded-full opacity-0 transition-opacity duration-700 will-change-transform"
          style={{
            background:
              'radial-gradient(circle, rgba(201,162,39,0.045) 0%, rgba(201,162,39,0.018) 40%, transparent 70%)',
            filter: 'blur(8px)',
          }}
        />
      )}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-2.5 w-2.5 rounded-full bg-gold mix-blend-screen transition-[width,height,opacity] duration-300 will-change-transform [body.nk-cursor-hover_&]:h-1.5 [body.nk-cursor-hover_&]:w-1.5"
      />
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[9998] h-9 w-9 rounded-full border border-gold/45 transition-[width,height,border-color,opacity] duration-300 will-change-transform [body.nk-cursor-hover_&]:h-14 [body.nk-cursor-hover_&]:w-14 [body.nk-cursor-hover_&]:border-gold-light/70"
      />
    </>
  );
}
