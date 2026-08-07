import Image from 'next/image';
import Link from 'next/link';
import { SITE } from '@/lib/data/team';
import { FOOTER_ROUTES, LEGAL_ROUTES } from '@/lib/data/routes';
import { FooterStormMount } from '@/components/shared/footer-storm-mount';
import { Reveal } from '@/components/motion/reveal';

const SOCIAL_PATHS: Record<string, string> = {
  Facebook:
    'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  LinkedIn:
    'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  Instagram:
    'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
  X: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
};

/* Company links come straight from the route manifest, so this column can
   never drift out of sync with what actually exists. Services stay as anchors
   into the home-page bento. */
const FOOTER_COLUMNS = [
  {
    title: 'Services',
    links: [
      { label: 'Web Development', href: '/#services' },
      { label: 'Mobile Apps', href: '/#services' },
      { label: 'UI/UX Design', href: '/#services' },
      { label: 'AI & Automation', href: '/#services' },
      { label: 'Landing Pages', href: '/#services' },
    ],
  },
  {
    title: 'Company',
    links: FOOTER_ROUTES.map((r) => ({
      label: r.footerLabel ?? r.label,
      href: r.href,
    })),
  },
];

export function SiteFooter() {
  return (
    <footer
      aria-label="Site footer"
      className="relative isolate overflow-hidden border-t border-gold/12 bg-midnight-gold"
    >
      {/* Storm layer — texture base + live procedural bolts */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <Image
          src="/images/fx/gold-lightning.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-[0.14] mix-blend-screen"
          quality={70}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bg via-transparent to-bg/95" />
        <div className="grid-overlay absolute inset-0 opacity-60" />
        <FooterStormMount />
      </div>

      <div className="container relative pb-12 pt-section-sm">
        {/* Oversized wordmark — the findrealestate lesson: give it room */}
        <Reveal className="mb-16">
          <p className="font-display text-display-lg leading-none text-gradient-gold opacity-90">
            NEXKEYS AGENCY
          </p>
        </Reveal>

        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.2fr]">
          <div>
            <p className="max-w-xs text-body-sm leading-relaxed text-fg-40">
              {SITE.tagline}
              <br />
              We partner with businesses to deliver impactful, measurable results.
            </p>

            <ul className="mt-7 flex gap-2.5">
              {SITE.socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="grid h-11 w-11 place-items-center rounded-xl border border-gold/14 bg-white/[0.03] text-fg-60 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/40 hover:bg-gold/10 hover:text-gold-light"
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d={SOCIAL_PATHS[s.label]} />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="mb-5 font-head text-label font-bold uppercase tracking-[0.14em] text-fg-40">
                {col.title}
              </h2>
              <ul className="flex flex-col gap-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-body-sm text-fg-60 transition-colors duration-300 hover:text-gold-light"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h2 className="mb-5 font-head text-label font-bold uppercase tracking-[0.14em] text-fg-40">
              Contact
            </h2>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href={`mailto:${SITE.email}`}
                  className="break-all text-body-sm text-fg-60 transition-colors hover:text-gold-light"
                >
                  {SITE.email}
                </a>
              </li>
              <li>
                <a
                  href={SITE.phoneHref}
                  className="text-body-sm text-fg-60 transition-colors hover:text-gold-light"
                >
                  {SITE.phone}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="divider-gold mt-14" />

        <div className="flex flex-col items-center justify-between gap-4 pt-7 sm:flex-row">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} {SITE.legalName}. All rights reserved.
          </p>
          <nav aria-label="Legal" className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {LEGAL_ROUTES.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="text-xs text-white/30 transition-colors hover:text-white"
              >
                {r.label.replace(/ (Policy|of Service|Notice)$/, '')}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
