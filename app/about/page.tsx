import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Handshake, Rocket, Target, Zap, type LucideIcon } from 'lucide-react';

import { TEAM, SITE } from '@/lib/data/team';
import { VALUES } from '@/lib/data/services';
import { listPosts } from '@/lib/blog';
import { BlogCard } from '@/components/blog/blog-card';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/reveal';
import { SectionHeader } from '@/components/ui/section-header';
import { Stats } from '@/components/sections/stats';
import { CTA } from '@/components/sections/cta';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'About',
  description:
    'NexKeys Agency is a two-person software studio: engineering and security, working directly with the clients we build for.',
  alternates: { canonical: `${SITE.url}/about` },
  openGraph: {
    title: 'About · NexKeys Agency',
    description:
      'A two-person software studio: engineering and security, working directly with the clients we build for.',
    url: `${SITE.url}/about`,
  },
};

const VALUE_ICONS: Record<string, LucideIcon> = {
  Target,
  Zap,
  Handshake,
  Rocket,
};

export default async function AboutPage() {
  /* Live from Firestore — the legacy About page hard-coded four posts that
     went stale the moment anything new was published (plan O9). */
  const posts = (await listPosts()).slice(0, 3);

  return (
    <>
      {/* ══ Header ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden ground-midnight pb-section-sm pt-[calc(var(--nav-h)+clamp(56px,10vw,120px))]">
        <div
          aria-hidden="true"
          className="grid-overlay pointer-events-none absolute inset-0 -z-10"
        />

        <div className="container">
          <Reveal>
            <p className="eyebrow">Who We Are</p>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="mt-5 max-w-4xl font-display text-display-lg">
              Small team.<br />
              <span className="text-gradient-gold">Direct line.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mt-6 max-w-xl text-body-lg text-fg-60">
              {SITE.tagline} {SITE.description}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══ Team ═════════════════════════════════════════════ */}
      <section aria-labelledby="team-heading" className="ground-midnight-soft py-section">
        <div className="container">
          <SectionHeader
            eyebrow="The Team"
            title={
              <span id="team-heading">
                Two people, <span className="text-gradient-gold">both hands on</span>
              </span>
            }
            description="You work with the people who build your product — no account layer in between."
          />

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {TEAM.map((member, i) => (
              <Reveal key={member.id} delay={i * 0.1}>
                <article className="group h-full overflow-hidden rounded-card border border-gold/12 bg-bg-2 transition-[border-color,box-shadow] duration-500 hover:border-gold/35 hover:shadow-lift">
                  <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[3/2]">
                    <Image
                      src={member.photo}
                      alt={`Portrait of ${member.name}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      /* Use the explicit `[transition-duration:…]` form here.
                         The `duration-` shorthand with an arbitrary value is
                         ambiguous — Tailwind cannot tell whether it means
                         transition- or animation-duration and warns on every
                         build. Note the shorthand is not written out anywhere
                         in this file, not even in a comment: Tailwind scans raw
                         file text, so mentioning it re-triggers the warning. */
                      className="object-cover object-top transition-transform [transition-duration:900ms] ease-luxe group-hover:scale-[1.04]"
                    />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg-2 via-bg-2/20 to-transparent"
                    />
                  </div>

                  <div className="p-6 sm:p-8">
                    <h3 className="font-head text-h3 font-bold text-white">{member.name}</h3>
                    <p className="mt-1 font-head text-[11px] font-bold uppercase tracking-[0.14em] text-gold">
                      {member.role}
                    </p>

                    <ul className="mt-5 flex flex-wrap gap-2">
                      {member.skills.map((skill) => (
                        <li
                          key={skill}
                          className="rounded-pill border border-gold/15 px-3 py-1 font-head text-[10px] font-bold uppercase tracking-[0.1em] text-fg-60"
                        >
                          {skill}
                        </li>
                      ))}
                    </ul>

                    <p className="mt-6 text-sm leading-relaxed text-fg-60">{member.bio}</p>

                    <div className="mt-6 flex flex-wrap gap-4">
                      {member.links.map((link) => (
                        <a
                          key={link.href}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-tap
                          className="group/link inline-flex items-center gap-1.5 font-head text-[11px] font-bold uppercase tracking-[0.1em] text-gold transition-colors hover:text-gold-light"
                        >
                          {link.label}
                          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/link:translate-x-1" />
                        </a>
                      ))}
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ Values ═══════════════════════════════════════════ */}
      <section aria-labelledby="values-heading" className="ground-midnight py-section">
        <div className="container">
          <SectionHeader
            eyebrow="How We Work"
            align="center"
            title={
              <span id="values-heading">
                What we <span className="text-gradient-gold">hold to</span>
              </span>
            }
          />

          <RevealGroup className="grid grid-cols-1 gap-5 xs:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value) => {
              const Icon = VALUE_ICONS[value.icon] ?? Target;
              return (
                <RevealItem key={value.id}>
                  <div className="glass-midnight h-full rounded-card p-6 transition-[border-color,transform] duration-500 ease-luxe hover:-translate-y-1 hover:border-gold/35">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-card border border-gold/25 bg-gold/[0.07]">
                      <Icon className="h-5 w-5 text-gold" aria-hidden="true" />
                    </span>
                    <h3 className="mt-5 font-head text-base font-bold text-white">
                      {value.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-fg-60">
                      {value.description}
                    </p>
                  </div>
                </RevealItem>
              );
            })}
          </RevealGroup>
        </div>
      </section>

      <Stats />

      {/* ══ Latest writing ═══════════════════════════════════ */}
      {posts.length > 0 && (
        <section aria-labelledby="writing-heading" className="ground-midnight-soft py-section">
          <div className="container">
            <SectionHeader
              eyebrow="From the Blog"
              title={
                <span id="writing-heading">
                  Latest <span className="text-gradient-gold">writing</span>
                </span>
              }
              description="Notes from the work — published as we go."
            />

            <div className="grid grid-cols-1 gap-6 xs:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>

            <Reveal delay={0.15} className="mt-12 text-center">
              <Link
                href="/blog"
                className="group inline-flex items-center gap-2 font-head text-sm font-bold uppercase tracking-[0.1em] text-gold transition-colors hover:text-gold-light"
              >
                Read the blog
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      <CTA />
    </>
  );
}
