'use client';

import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';
import { useCapabilities } from '@/hooks/use-capabilities';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Seconds. */
  delay?: number;
  duration?: number;
  direction?: Direction;
  /** Travel distance in px. */
  distance?: number;
  /** Fires once and stays revealed. */
  once?: boolean;
  /** Viewport trigger margin. */
  margin?: string;
}

const OFFSET: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 1 },
  down: { x: 0, y: -1 },
  left: { x: 1, y: 0 },
  right: { x: -1, y: 0 },
  none: { x: 0, y: 0 },
};

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The single scroll-reveal system.
 *
 * Replaces THREE overlapping legacy mechanisms:
 *   · the CSS `.reveal` + IntersectionObserver in main.js
 *   · animation.js GSAP ScrollTrigger — which 404'd on 7 of 8 pages (plan §4.1)
 *   · the `nk-sweep` one-shot in vfx.js
 *
 * Motion is intentionally slow and soft — a long fade with a small rise and a
 * blur that resolves, never a snap. Under prefers-reduced-motion it renders
 * instantly visible with no transform at all.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  duration = 0.9,
  direction = 'up',
  distance = 28,
  once = true,
  margin = '0px 0px -80px 0px',
}: RevealProps) {
  const { reduced } = useCapabilities();

  if (reduced) return <div className={className}>{children}</div>;

  const off = OFFSET[direction];

  const variants: Variants = {
    hidden: {
      opacity: 0,
      x: off.x * distance,
      y: off.y * distance,
      filter: 'blur(6px)',
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration, delay, ease: EASE },
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: margin as `${number}px ${number}px ${number}px ${number}px` }}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}

/** Parent that staggers its <RevealItem> children. */
export function RevealGroup({
  children,
  className,
  stagger = 0.09,
  delay = 0,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  once?: boolean;
}) {
  const { reduced } = useCapabilities();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '0px 0px -80px 0px' }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

export const revealItemVariants: Variants = {
  hidden: { opacity: 0, y: 26, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.85, ease: EASE },
  },
};

export function RevealItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { reduced } = useCapabilities();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div className={className} variants={revealItemVariants}>
      {children}
    </motion.div>
  );
}
