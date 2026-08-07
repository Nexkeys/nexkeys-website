'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

import { InternshipForm } from '@/components/forms/internship-form';
import { WaitlistForm } from '@/components/forms/waitlist-form';
import { getHiringOpen } from '@/lib/internship';
import { TRACKS } from '@/lib/data/tracks';

const PERKS = [
  'Hands-on work on real client products',
  'Direct mentorship from senior engineers',
  'Portfolio-ready projects you actually ship',
  'Certificate on successful completion',
];

const STATS = [
  { num: String(TRACKS.length), label: 'Specialized Tracks' },
  { num: '100%', label: 'Remote' },
  { num: '₦0', label: 'Tuition' },
];

export function InternshipPortal() {
  const [hiringOpen, setHiringOpen] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    getHiringOpen().then((open) => alive && setHiringOpen(open));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      {/* Page header */}
      <header className="relative isolate overflow-hidden pb-14 pt-[calc(var(--nav-h)+5rem)]">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <div className="grid-overlay absolute inset-0" />
          <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gold/[0.09] blur-[120px]" />
        </div>

        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto inline-flex items-center gap-2.5 rounded-pill border border-gold/30 bg-gold/[0.12] px-4 py-1.5"
          >
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-gold shadow-[0_0_10px_#C9A227]" />
            <span className="font-head text-label font-bold uppercase tracking-[0.2em] text-gold">
              NexKeys Talent Accelerator
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-7 max-w-3xl font-head text-h1 font-extrabold"
          >
            Learn by shipping
            <br />
            <span className="text-gradient-gold">real products.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-6 max-w-xl text-body-lg font-light text-fg-60"
          >
            {TRACKS.length} specialized tracks. Senior mentorship. Genuine client work — not
            tutorials. Apply once, and we will match you to the track that fits.
          </motion.p>
        </div>
      </header>

      {/* Split card */}
      <section className="pb-section" aria-label="Internship application">
        <div className="container">
          <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[24px] border border-white/10 bg-[rgba(10,10,18,0.75)] shadow-midnight backdrop-blur-2xl lg:grid-cols-[1fr_1.25fr]">
            {/* Form panel — first on mobile */}
            <div className="order-1 bg-[rgba(5,5,8,0.85)] p-6 sm:p-9 lg:order-2 lg:p-11">
              {hiringOpen === null ? (
                <div className="flex flex-col items-center gap-4 py-24 text-fg-40">
                  <Loader2 className="h-8 w-8 animate-spin text-gold" />
                  <p className="text-body-sm">Checking application window…</p>
                </div>
              ) : hiringOpen ? (
                <InternshipForm />
              ) : (
                <WaitlistForm />
              )}
            </div>

            {/* Info panel */}
            <aside className="relative order-2 flex flex-col justify-between overflow-hidden border-t border-white/[0.08] p-6 sm:p-9 lg:order-1 lg:border-r lg:border-t-0 lg:p-11">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 bg-gradient-midnight-gold"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-1/4 -top-1/4 -z-10 h-[140%] w-[140%] rounded-full"
                style={{
                  background:
                    'radial-gradient(circle, rgba(201,162,39,0.14) 0%, transparent 60%)',
                }}
              />

              <div className="relative">
                <Image
                  src="/images/brand/logo.jpg"
                  alt="NexKeys"
                  width={160}
                  height={160}
                  className="mx-auto mb-8 w-[140px] rounded-2xl object-contain drop-shadow-[0_0_20px_rgba(201,162,39,0.4)] transition-transform duration-500 hover:scale-[1.04] lg:w-[170px]"
                />

                <h2 className="mb-4 font-head text-2xl font-bold sm:text-3xl">
                  Build a career, not just a certificate.
                </h2>

                <p className="mb-7 text-body-sm leading-relaxed text-fg-60">
                  You will sit inside a working agency, on live products, with people who
                  review your code and your thinking. Every track ends with something real in
                  your portfolio.
                </p>

                <ul className="mb-9 flex flex-col gap-3.5">
                  {PERKS.map((perk) => (
                    <li key={perk} className="flex items-center gap-3 text-sm text-white">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-gold/40 bg-gold/[0.15] text-xs text-gold">
                        ✓
                      </span>
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative flex gap-3 border-t border-white/[0.08] pt-6">
                {STATS.map((s) => (
                  <div
                    key={s.label}
                    className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 text-center"
                  >
                    <span className="block font-head text-lg font-bold text-gold">{s.num}</span>
                    <span className="text-xs text-fg-40">{s.label}</span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
