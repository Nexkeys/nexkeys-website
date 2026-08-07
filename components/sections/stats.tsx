'use client';

import { motion } from 'framer-motion';
import { STATS } from '@/lib/data/services';
import { Counter } from '@/components/motion/counter';
import { RevealGroup, RevealItem } from '@/components/motion/reveal';

export function Stats() {
  return (
    <section aria-label="Key metrics" className="ground-midnight-soft py-section-sm">
      <div className="container">
        <RevealGroup className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-gold/12 bg-gold/12 lg:grid-cols-4">
          {STATS.map((stat) => (
            <RevealItem key={stat.label} className="group relative bg-bg-2">
              <div className="relative overflow-hidden px-6 py-10 transition-colors duration-500 group-hover:bg-midnight-gold md:px-8 md:py-12">
                <div className="font-display text-[clamp(40px,6vw,58px)] leading-none text-gradient-gold">
                  <Counter value={stat.value} suffix={stat.suffix} />
                </div>

                <p className="mt-2 font-head text-[13px] font-medium text-fg-60">
                  {stat.label}
                </p>

                {/* Gold fill bar — draws in as the counter completes */}
                <motion.span
                  aria-hidden="true"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 1.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute bottom-0 left-0 h-px w-full origin-left bg-gradient-to-r from-gold via-gold-light to-transparent"
                />
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
