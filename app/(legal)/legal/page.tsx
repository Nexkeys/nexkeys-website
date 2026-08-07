import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Mail } from 'lucide-react';

import { LEGAL } from '@/lib/data/legal/legal';
import { SITE } from '@/lib/data/team';
import { LegalBlocks } from '@/components/legal/legal-blocks';
import { LegalToc } from '@/components/legal/legal-toc';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/reveal';
import { SectionHeader } from '@/components/ui/section-header';

export const metadata: Metadata = {
  title: 'Legal Hub',
  description:
    'All NexKeys Agency legal documents in one place — Terms & Conditions, Privacy Policy and Cookie Policy.',
  alternates: { canonical: `${SITE.url}/legal` },
};

/**
 * The Legal Hub is structurally different from the other two documents: it is
 * an index of policies with the Cookie Policy inlined beneath, so it does not
 * use the shared `LegalPage` shell. Copy is verbatim from legacy legal.html.
 */
const POLICY_CARDS = [
  {
    icon: '📜',
    meta: 'Version 1.2 — Jan 2026',
    title: 'Terms & Conditions',
    description:
      'The legal agreement governing your use of NexKeys services, including project terms, intellectual property, payment schedules, acceptable use, and liability limitations.',
    tags: ['16 Sections', 'All Services'],
    href: '/terms',
    cta: 'Read Document',
  },
  {
    icon: '🔒',
    meta: 'Version 1.2 — Jan 2026',
    title: 'Privacy Policy',
    description:
      'How NexKeys collects, uses, stores, and protects your personal data. Covers cookies, analytics, third-party services, your data rights, and NDPR compliance.',
    tags: ['16 Sections', 'NDPR Compliant'],
    href: '/privacy',
    cta: 'Read Document',
  },
  {
    icon: '🍪',
    meta: 'Version 1.0 — Jan 2026',
    title: 'Cookie Policy',
    description:
      'A detailed breakdown of how NexKeys uses cookies and tracking technologies on our website, including how to manage your cookie preferences.',
    tags: ['Inline Below'],
    href: '#cookie-policy',
    cta: 'See Below',
  },
];

export default function LegalHubPage() {
  return (
    <>
      {/* ══ Hero ═════════════════════════════════════════════ */}
      <header className="relative overflow-hidden ground-midnight pb-section-sm pt-[calc(var(--nav-h)+clamp(48px,9vw,104px))]">
        <div
          aria-hidden="true"
          className="grid-overlay pointer-events-none absolute inset-0 -z-10"
        />

        <div className="container">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-pill border border-gold/25 px-4 py-1.5 font-head text-[10px] font-bold uppercase tracking-[0.14em] text-gold">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-gold" />
              Transparency &amp; Trust
            </span>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="mt-6 font-display text-display-md">{LEGAL.title}</h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="measure mt-5 text-body-lg text-fg-60">{LEGAL.intro}</p>
          </Reveal>

          {LEGAL.meta.length > 0 && (
            <Reveal delay={0.24}>
              <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-5 xs:flex xs:flex-wrap xs:gap-x-12">
                {LEGAL.meta.map((item) => (
                  <div key={item.label}>
                    <dt className="font-head text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
                      {item.label}
                    </dt>
                    <dd className="mt-1 text-sm text-fg-80">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          )}
        </div>
      </header>

      {/* ══ Policy cards ═════════════════════════════════════ */}
      <section aria-labelledby="policies-heading" className="ground-midnight-soft py-section">
        <div className="container">
          <SectionHeader
            eyebrow="Our Policies"
            title={
              <span id="policies-heading">
                Policy <span className="text-gradient-gold">Documents</span>
              </span>
            }
            description="Clear, accessible legal documentation. Click any document to read the full policy."
          />

          <RevealGroup className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {POLICY_CARDS.map((card) => (
              <RevealItem key={card.title}>
                <Link
                  href={card.href}
                  className="group flex h-full flex-col gap-3 rounded-card border border-gold/12 bg-bg-2 p-6 transition-[border-color,transform,box-shadow] duration-500 ease-luxe hover:-translate-y-1 hover:border-gold/40 hover:shadow-lift"
                >
                  <span
                    aria-hidden="true"
                    className="inline-flex h-12 w-12 items-center justify-center rounded-card border border-gold/20 bg-gold/[0.07] text-xl"
                  >
                    {card.icon}
                  </span>

                  <span className="font-head text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
                    {card.meta}
                  </span>

                  <h3 className="font-head text-h3 font-bold text-white transition-colors duration-400 group-hover:text-gold-light">
                    {card.title}
                  </h3>

                  <p className="text-sm leading-relaxed text-fg-60">{card.description}</p>

                  <div className="mt-1 flex flex-wrap gap-2">
                    {card.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-pill bg-gold/10 px-2.5 py-1 font-head text-[11px] font-bold uppercase tracking-[0.1em] text-gold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <span className="mt-auto inline-flex items-center gap-1.5 pt-4 font-head text-[11px] font-bold uppercase tracking-[0.1em] text-gold transition-all duration-500 group-hover:gap-2.5">
                    {card.cta}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ══ Cookie Policy (inlined) ══════════════════════════ */}
      <section
        id="cookie-policy"
        aria-labelledby="cookie-heading"
        className="scroll-mt-[calc(var(--nav-h)+32px)] ground-midnight py-section"
      >
        <div className="container">
          <SectionHeader
            eyebrow="In Detail"
            title={
              <span id="cookie-heading">
                Cookie <span className="text-gradient-gold">Policy</span>
              </span>
            }
          />

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)] lg:gap-16">
            <LegalToc sections={LEGAL.sections} />

            <article className="min-w-0">
              {LEGAL.sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="mb-12 scroll-mt-[calc(var(--nav-h)+32px)] border-b border-gold/10 pb-12 last:mb-0 last:border-0 last:pb-0"
                >
                  <h3 className="mb-5 flex items-center gap-3 font-head text-[22px] font-bold text-white">
                    {section.num && (
                      <span
                        aria-hidden="true"
                        className="shrink-0 font-display text-[28px] leading-none text-gold/50"
                      >
                        {section.num}
                      </span>
                    )}
                    {section.heading}
                  </h3>

                  <LegalBlocks blocks={section.blocks} />
                </section>
              ))}
            </article>
          </div>
        </div>
      </section>

      {/* ══ Commitment ═══════════════════════════════════════ */}
      <section aria-labelledby="commitment-heading" className="bg-bg-2 py-section-sm">
        <div className="container">
          <Reveal className="mx-auto max-w-[680px] text-center">
            <p className="eyebrow justify-center">Our Commitment</p>

            <h2 id="commitment-heading" className="mt-5 font-head text-h2 font-bold">
              Built on <span className="text-gradient-gold">Trust</span>
            </h2>

            <p className="mt-5 text-body-lg text-fg-60">
              NexKeys Agency is committed to operating with complete transparency. Our
              legal documents are written in plain language because we believe you
              deserve to understand exactly how we operate.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link
                href="/contact"
                className="sheen group inline-flex items-center gap-2 rounded-pill bg-gradient-gold px-6 py-3 font-head text-sm font-bold text-bg transition-transform duration-500 ease-luxe hover:-translate-y-0.5"
              >
                Book a Discovery Call
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <a
                href={`mailto:${SITE.email}`}
                data-tap
                className="inline-flex items-center gap-2 rounded-pill border border-gold/25 px-6 py-3 font-head text-sm font-bold text-fg-80 transition-colors duration-500 ease-luxe hover:border-gold/60 hover:text-white"
              >
                <Mail className="h-4 w-4" />
                Email Legal Team
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
