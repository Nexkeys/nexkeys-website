'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { NkMonogram } from '@/components/hero/nk-monogram';
import { Magnetic } from '@/components/motion/magnetic';
import { useCapabilities } from '@/hooks/use-capabilities';

/* WebGL is code-split and desktop-only — it never reaches a phone bundle. */
const ParticleField = dynamic(() => import('@/components/hero/particle-field'), {
  ssr: false,
});

const HEADLINE = [
  { text: 'We Build', gradient: false },
  { text: 'Digital Products', gradient: false },
  { text: 'That Convert.', gradient: true },
];

export function Hero() {
  const { canHeavy, reduced, isMobile } = useCapabilities();
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(typeof document === 'undefined' ? true : document.visibilityState === 'visible');

  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsVisible(Boolean(entry?.isIntersecting));
      },
      { threshold: 0.2, rootMargin: '200px 0px' }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      setIsPageVisible(document.visibilityState === 'visible');
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const shouldRenderParticles = canHeavy && !reduced && !isMobile && isVisible && isPageVisible;

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.11, delayChildren: 0.15 } },
  };

  const item = {
    hidden: { opacity: 0, y: 26, filter: 'blur(8px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 1.05, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <section
      ref={sectionRef}
      aria-label="Introduction"
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden pt-nav"
    >
      {/* Atmosphere */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="grid-overlay absolute inset-0" />
        <div className="absolute -right-24 -top-52 h-[600px] w-[600px] rounded-full bg-gold/[0.11] blur-[120px]" />
        <div className="absolute -bottom-28 -left-28 h-[500px] w-[500px] rounded-full bg-gold-dark/[0.08] blur-[120px]" />
        {shouldRenderParticles && <ParticleField />}
        {/* Fade into the section below */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bg" />
      </div>

      <div className="container">
        <motion.div
          variants={reduced ? undefined : container}
          initial={reduced ? undefined : 'hidden'}
          animate={reduced ? undefined : 'visible'}
          className="grid items-center gap-14 py-20 lg:grid-cols-2 lg:gap-12 lg:py-28"
        >
          {/* Monogram first on mobile — fixes the dead .hero-right rule (plan §4.4) */}
          <motion.div variants={reduced ? undefined : item} className="order-1 lg:order-2">
            <NkMonogram />
          </motion.div>

          <div className="order-2 flex flex-col items-start lg:order-1">
            <motion.div
              variants={reduced ? undefined : item}
              className="mb-8 inline-flex items-center gap-2.5 rounded-pill border border-white/10 bg-white/[0.04] px-4 py-1.5 backdrop-blur-md"
            >
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-gold shadow-[0_0_8px_#C9A227]" />
              <span className="font-head text-label font-bold uppercase tracking-[0.2em] text-fg-60">
                Your Reliable IT Partner
              </span>
            </motion.div>

            <h1 className="mb-7 font-head text-h1 font-extrabold">
              {HEADLINE.map((line) => (
                <motion.span
                  key={line.text}
                  variants={reduced ? undefined : item}
                  className={`block ${line.gradient ? 'text-gradient-gold' : ''}`}
                >
                  {line.text}
                </motion.span>
              ))}
            </h1>

            <motion.p
              variants={reduced ? undefined : item}
              className="mb-10 max-w-[30rem] text-body-lg font-light text-fg-60"
            >
              From new digital projects to process optimization and support, NexKeys partners
              with businesses to deliver impactful, measurable results.
            </motion.p>

            <motion.div
              variants={reduced ? undefined : item}
              className="flex flex-wrap items-center gap-4"
            >
              <Magnetic>
                <Link
                  href="/contact"
                  className="sheen group inline-flex items-center gap-2 rounded-pill bg-gradient-gold px-7 py-3.5 font-head text-sm font-bold text-bg shadow-gold transition-shadow duration-500 hover:shadow-gold-lg"
                >
                  Book a Call
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Magnetic>

              <Magnetic>
                <Link
                  href="/work"
                  className="glass group inline-flex items-center gap-2 rounded-pill px-7 py-3.5 font-head text-sm font-semibold text-white transition-all duration-500 hover:border-gold/45 hover:shadow-[0_0_28px_rgba(201,162,39,0.12)]"
                >
                  View Our Work
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Magnetic>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="pointer-events-none absolute bottom-9 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
        aria-hidden="true"
      >
        <span className="h-12 w-px animate-scroll-pulse bg-gradient-to-b from-gold to-transparent" />
        <span className="font-head text-[10px] uppercase tracking-[0.2em] text-fg-40">
          Scroll
        </span>
      </motion.div>
    </section>
  );
}
