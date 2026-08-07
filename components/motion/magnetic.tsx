'use client';

import { useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useCapabilities } from '@/hooks/use-capabilities';

/**
 * Magnetic hover — the element leans toward the cursor and springs back.
 *
 * Consolidates the TWO competing legacy implementations that fought over the
 * same `transform` property (plan §4.11): main.js:168 wrote inline styles
 * while vfx.js:384 animated with GSAP. This is the only one now.
 */
export function Magnetic({
  children,
  className,
  strength = 0.28,
  radius = 48,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
  radius?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { isMobile, reduced } = useCapabilities();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 160, damping: 15, mass: 0.35 });
  const springY = useSpring(y, { stiffness: 160, damping: 15, mass: 0.35 });

  if (isMobile || reduced) {
    return <div className={className}>{children}</div>;
  }

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);

    if (Math.hypot(dx, dy) < r.width / 2 + radius) {
      x.set(dx * strength);
      y.set(dy * strength);
    }
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMove}
      onMouseLeave={reset}
    >
      {children}
    </motion.div>
  );
}
