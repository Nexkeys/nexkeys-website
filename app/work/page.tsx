import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { getPublicWorkContent } from '@/lib/work';
import { SITE } from '@/lib/data/team';
import { WORK_DETAILS } from '@/lib/data/project-details';
import { WorkGrid } from '@/components/sections/work-grid';
import { WorkDetails } from '@/components/sections/work-details';
import { Testimonials } from '@/components/sections/testimonials';
import { CTA } from '@/components/sections/cta';
import { Reveal } from '@/components/motion/reveal';
import { SectionHeader } from '@/components/ui/section-header';

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'Selected work from NexKeys Agency — web apps, fintech platforms, e-commerce storefronts and gaming products built for businesses that needed to move.',
  alternates: { canonical: `${SITE.url}/work` },
  openGraph: {
    title: 'Projects · NexKeys Agency',
    description:
      'Selected work from NexKeys Agency — web apps, fintech, e-commerce and gaming products.',
    url: `${SITE.url}/work`,
  },
};

/* Content is CMS-driven with the built-in catalogue as fallback (plan N11). */
export const revalidate = 300;

export default async function WorkPage() {
  const { headerTitle, headerDescription, projects } = await getPublicWorkContent();

  const headerStats = [
    { value: `${projects.length}`, label: 'Projects Shipped' },
    { value: `${projects.filter((p) => p.isLive).length}`, label: 'Live in Production' },
    { value: '6', label: 'Industries' },
  ];

  return (
    <>
      {/* ══ Header ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden ground-midnight pb-section-sm pt-[calc(var(--nav-h)+clamp(56px,10vw,120px))]">
        <div
          aria-hidden="true"
          className="grid-overlay pointer-events-none absolute inset-0 -z-10"
        />

        <div className="container">
          <Reveal>
            <p className="eyebrow">Selected Work</p>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="mt-5 max-w-4xl font-display text-display-lg">
              {headerTitle ?? (
                <>
                  Products we<br />
                  <span className="text-gradient-gold">put into the world.</span>
                </>
              )}
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mt-6 max-w-xl text-body-lg text-fg-60">
              {headerDescription ??
                'Every project below is a real, shipped product — not a concept. Open any of them and judge for yourself.'}
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-6 xs:gap-x-14">
              {headerStats.map((s) => (
                <div key={s.label}>
                  <dt className="sr-only">{s.label}</dt>
                  <dd>
                    <span className="block font-display text-display-md text-gradient-gold">
                      {s.value}
                    </span>
                    <span className="mt-1 block font-head text-label uppercase text-white/35">
                      {s.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* ══ Grid + filters ══════════════════════════════════ */}
      <section
        aria-labelledby="work-grid-heading"
        className="ground-midnight-soft py-section"
      >
        <div className="container">
          <SectionHeader
            eyebrow="The Portfolio"
            title={
              <span id="work-grid-heading">
                Browse by <span className="text-gradient-gold">discipline</span>
              </span>
            }
            description="Filter the full catalogue. Every card opens the live product in a new tab."
          />

          <WorkGrid projects={projects} />
        </div>
      </section>

      {/* ══ Long-form write-ups ═════════════════════════════ */}
      <section
        aria-labelledby="details-heading"
        className="ground-midnight py-section-sm"
      >
        <div className="container">
          <SectionHeader
            eyebrow="In Depth"
            title={
              <span id="details-heading">
                The work, <span className="text-gradient-gold">in detail</span>
              </span>
            }
            description="What each project set out to do, and what we actually built."
          />

          <WorkDetails details={WORK_DETAILS} projects={projects} />
        </div>
      </section>

      {/* ══ Testimonials ════════════════════════════════════ */}
      <Testimonials />

      {/* ══ Bridge to the internship ════════════════════════ */}
      <section className="ground-midnight-soft py-section-sm">
        <div className="container">
          <Reveal>
            <div className="glass-midnight mx-auto flex max-w-3xl flex-col items-center gap-5 rounded-card px-6 py-10 text-center sm:px-10">
              <p className="eyebrow">Build with us</p>
              <h2 className="font-head text-h2 font-bold">
                We also train the next intake.
              </h2>
              <p className="max-w-md text-fg-60">
                Ten tracks, real projects, real mentorship. Applications are
                reviewed on a rolling basis.
              </p>
              <Link
                href="/internship"
                className="group inline-flex items-center gap-2 font-head text-sm font-bold uppercase tracking-[0.1em] text-gold transition-colors hover:text-gold-light"
              >
                See the internship
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <CTA />
    </>
  );
}
