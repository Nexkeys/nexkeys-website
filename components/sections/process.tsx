'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { PROCESS_STEPS } from '@/lib/data/services';
import { SectionHeader } from '@/components/ui/section-header';
import { useCapabilities } from '@/hooks/use-capabilities';

/**
 * Process timeline. The connecting rule now DRAWS ITSELF as the section
 * scrolls through the viewport, and each numbered node fills in turn —
 * the legacy version was a static gradient line (plan §8.1).
 */
export function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const { reduced } = useCapabilities();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 75%', 'center 45%'],
  });

  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section className="ground-midnight-soft py-section" aria-labelledby="process-heading">
      <div className="container">
        <SectionHeader
          align="center"
          eyebrow="How We Work"
          title={
            <span id="process-heading">
              Our <span className="text-gradient-gold">Process</span>
            </span>
          }
          description="A proven four-step approach from concept to a live, scaling product."
        />

        <div ref={ref} className="relative">
          {/* Self-drawing connector — desktop only */}
          <div
            aria-hidden="true"
            className="absolute left-[10%] right-[10%] top-6 hidden h-px bg-white/[0.06] lg:block"
          >
            <motion.div
              style={{ scaleX: reduced ? 1 : lineScale }}
              className="h-full w-full origin-left bg-gradient-to-r from-transparent via-gold-light to-gold-dark"
            />
          </div>

          <ol className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {PROCESS_STEPS.map((step, i) => (
              <motion.li
                key={step.num}
                initial={reduced ? undefined : { opacity: 0, y: 32 }}
                whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '0px 0px -60px 0px' }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.14,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative flex flex-col items-center px-3 text-center"
              >
                <span className="relative z-10 mb-6 grid h-12 w-12 place-items-center rounded-full border-2 border-gold bg-bg font-head text-[13px] font-extrabold text-gold-light shadow-gold">
                  {step.num}
                </span>

                <h3 className="mb-2.5 font-head text-[15px] font-bold">{step.title}</h3>
                <p className="text-[13px] leading-relaxed text-fg-60">{step.description}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
