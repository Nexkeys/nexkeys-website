import Link from 'next/link';
import { ArrowRight, Mail } from 'lucide-react';
import { CTA_METRICS } from '@/lib/data/services';
import { SITE } from '@/lib/data/team';
import { Reveal } from '@/components/motion/reveal';
import { Magnetic } from '@/components/motion/magnetic';

export function CTA() {
  return (
    <section className="relative isolate overflow-hidden py-section" aria-labelledby="cta-heading">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(201,162,39,0.10) 0%, transparent 70%)',
        }}
      />

      <div className="container">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <Reveal>
            <p className="eyebrow">Ready to Start?</p>
          </Reveal>

          <Reveal delay={0.08}>
            <h2 id="cta-heading" className="mt-6 font-head text-h1 font-extrabold">
              Let&apos;s Build Something
              <br />
              <span className="text-gradient-gold">Extraordinary.</span>
            </h2>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mt-6 max-w-lg text-body-lg font-light text-fg-60">
              Whether you have a fully fleshed-out idea or just a spark, at NexKeys we&apos;ll
              help you turn it into a product users love.
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="mt-11 flex flex-wrap justify-center gap-4">
              <Magnetic>
                <Link
                  href="/contact"
                  className="sheen group inline-flex items-center gap-2 rounded-pill bg-gradient-gold px-8 py-4 font-head text-sm font-bold text-bg shadow-gold transition-shadow duration-500 hover:shadow-gold-lg"
                >
                  Book a Free Call
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Magnetic>

              <Magnetic>
                <a
                  href={`mailto:${SITE.email}`}
                  className="glass inline-flex items-center gap-2 rounded-pill px-8 py-4 font-head text-sm font-semibold text-white transition-all duration-500 hover:border-gold/45"
                >
                  <Mail className="h-4 w-4" />
                  Send a Brief
                </a>
              </Magnetic>
            </div>
          </Reveal>

          <Reveal delay={0.32} className="w-full">
            <div className="mt-14 flex flex-wrap items-center justify-center gap-y-8 border-t border-gold/12 pt-12">
              {CTA_METRICS.map((metric, i) => (
                <div key={metric.label} className="flex items-center">
                  <div className="flex min-w-[9rem] flex-col items-center gap-1">
                    <span className="font-display text-[40px] leading-none text-gradient-gold">
                      {metric.value}
                    </span>
                    <span className="font-head text-[11px] font-semibold uppercase tracking-[0.1em] text-white/30">
                      {metric.label}
                    </span>
                  </div>
                  {i < CTA_METRICS.length - 1 && (
                    <span aria-hidden="true" className="hidden h-11 w-px bg-gold/12 sm:block" />
                  )}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
