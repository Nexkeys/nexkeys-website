'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useCapabilities } from '@/hooks/use-capabilities';

const CHIPS = [
  { text: '⚡ Next-gen Stack', className: 'top-[6%] -left-[16%]', anim: 'animate-float-a' },
  { text: '🚀 50+ Projects', className: 'bottom-[10%] -right-[10%]', anim: 'animate-float-b' },
  { text: '✦ Award-ready Design', className: 'top-[62%] -left-[14%]', anim: 'animate-float-a' },
];

/**
 * The NK monogram — kept from the legacy site (it is the strongest single
 * visual the brand owns) but rebuilt with real 3D: the whole assembly now
 * tilts in perspective toward the pointer, with each layer at a different
 * depth so the rings, glow and letters separate as you move.
 */
export function NkMonogram() {
  const ref = useRef<HTMLDivElement>(null);
  const { isMobile, reduced } = useCapabilities();

  const px = useMotionValue(0);
  const py = useMotionValue(0);

  const spring = { stiffness: 110, damping: 18, mass: 0.5 };
  const rotX = useSpring(useTransform(py, [-0.5, 0.5], [9, -9]), spring);
  const rotY = useSpring(useTransform(px, [-0.5, 0.5], [-11, 11]), spring);

  const layer1 = useSpring(useTransform(px, [-0.5, 0.5], [-14, 14]), spring);
  const layer2 = useSpring(useTransform(px, [-0.5, 0.5], [-26, 26]), spring);
  const layer1Y = useSpring(useTransform(py, [-0.5, 0.5], [-10, 10]), spring);

  const interactive = !isMobile && !reduced;

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };

  const onLeave = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative grid place-items-center"
      style={{ perspective: 1000 }}
      aria-hidden="true"
    >
      <motion.div
        /* `min()` in the lower bound so the ring can shrink below its 220px
           floor on ultra-narrow screens. At >=320px `min()` resolves to 220px
           and the size is unchanged — see the same pattern in the type scale. */
        className="relative grid h-[clamp(min(220px,70vw),34vw,420px)] w-[clamp(min(220px,70vw),34vw,420px)] place-items-center"
        style={
          interactive
            ? { rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d' }
            : undefined
        }
      >
        {/* Breathing glow */}
        <motion.div
          className="absolute inset-[-12%] animate-glow-breathe rounded-full bg-gradient-gold opacity-20 blur-[80px]"
          style={interactive ? { x: layer2, y: layer1Y } : undefined}
        />

        {/* Outer ring with travelling dot */}
        <motion.div
          className="absolute inset-[-6%] animate-ring-spin rounded-full border border-gold/25"
          style={interactive ? { x: layer1, translateZ: 40 } : undefined}
        >
          <span className="absolute right-[-5px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-gold shadow-[0_0_14px_#C9A227,0_0_28px_rgba(201,162,39,0.45)]" />
        </motion.div>

        {/* Inner dashed ring */}
        <motion.div
          className="absolute inset-[-19%] animate-ring-spin-slow rounded-full border border-dashed border-gold-dark/25"
          style={interactive ? { x: layer2, translateZ: 20 } : undefined}
        />

        {/* Letters */}
        <motion.span
          className="relative select-none bg-[linear-gradient(135deg,#F0CC50_0%,#C9A227_40%,#8B6914_75%,#F0CC50_100%)] bg-clip-text font-display text-[clamp(min(120px,38vw),17vw,240px)] leading-none tracking-[0.04em] text-transparent"
          style={interactive ? { translateZ: 70 } : undefined}
        >
          NK
        </motion.span>

        {/* Floating chips — desktop only */}
        {!isMobile &&
          CHIPS.map((chip) => (
            <motion.span
              key={chip.text}
              className={`absolute hidden whitespace-nowrap rounded-pill border border-gold/22 bg-[rgba(12,11,5,0.75)] px-3.5 py-1.5 font-head text-xs font-semibold text-fg-80 backdrop-blur-md lg:block ${chip.className} ${reduced ? '' : chip.anim}`}
              style={interactive ? { translateZ: 90 } : undefined}
            >
              {chip.text}
            </motion.span>
          ))}
      </motion.div>
    </div>
  );
}
