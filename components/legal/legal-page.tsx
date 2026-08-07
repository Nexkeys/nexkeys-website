import type { LegalDocument } from '@/lib/types';
import { LegalBlocks } from '@/components/legal/legal-blocks';
import { LegalToc } from '@/components/legal/legal-toc';
import { Reveal } from '@/components/motion/reveal';

/**
 * Shared shell for a full legal document.
 *
 * The legacy privacy.html, terms.html and legal.html each carried their own
 * copy of this layout — roughly 1,300 duplicated lines (plan §8.7). One
 * component now serves all of them.
 */
export function LegalPage({
  doc,
  badge = 'Legal Document',
}: {
  doc: LegalDocument;
  badge?: string;
}) {
  return (
    <>
      {/* ══ Header ═══════════════════════════════════════════ */}
      <header className="relative overflow-hidden ground-midnight pb-section-sm pt-[calc(var(--nav-h)+clamp(48px,9vw,104px))]">
        <div
          aria-hidden="true"
          className="grid-overlay pointer-events-none absolute inset-0 -z-10"
        />

        <div className="container">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-pill border border-gold/25 px-4 py-1.5 font-head text-[10px] font-bold uppercase tracking-[0.14em] text-gold">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-gold" />
              {badge}
            </span>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="mt-6 font-display text-display-md">{doc.title}</h1>
          </Reveal>

          {doc.intro && (
            <Reveal delay={0.16}>
              <p className="measure mt-5 text-body-lg text-fg-60">{doc.intro}</p>
            </Reveal>
          )}

          {doc.meta.length > 0 && (
            <Reveal delay={0.24}>
              <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-5 xs:flex xs:flex-wrap xs:gap-x-12">
                {doc.meta.map((item) => (
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

      {/* ══ Document ═════════════════════════════════════════ */}
      <div className="ground-midnight-soft py-section-sm">
        <div className="container">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)] lg:gap-16">
            <LegalToc sections={doc.sections} />

            <article className="min-w-0">
              {doc.sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="mb-12 scroll-mt-[calc(var(--nav-h)+32px)] border-b border-gold/10 pb-12 last:mb-0 last:border-0 last:pb-0"
                >
                  <h2 className="mb-5 flex items-center gap-3 font-head text-[22px] font-bold text-white">
                    {section.num && (
                      <span
                        aria-hidden="true"
                        className="shrink-0 font-display text-[28px] leading-none text-gold/50"
                      >
                        {section.num}
                      </span>
                    )}
                    {section.heading}
                  </h2>

                  <LegalBlocks blocks={section.blocks} />
                </section>
              ))}
            </article>
          </div>
        </div>
      </div>
    </>
  );
}
