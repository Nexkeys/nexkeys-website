import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { NAV_ROUTES } from '@/lib/data/routes';

export const metadata: Metadata = {
  title: 'Page Not Found',
  robots: { index: false, follow: true },
};

/**
 * Branded 404 (plan O20). The legacy site fell through to the host default —
 * a white page with no way back, on an otherwise black-and-gold site.
 */
export default function NotFound() {
  return (
    <section className="relative flex min-h-[78vh] items-center overflow-hidden ground-midnight py-section">
      <div
        aria-hidden="true"
        className="grid-overlay pointer-events-none absolute inset-0 -z-10"
      />

      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow justify-center">Error 404</p>

          <h1 className="mt-5 font-display text-display-lg text-gradient-gold">
            Lost the thread
          </h1>

          <p className="mx-auto mt-5 max-w-md text-body-lg text-fg-60">
            The page you were looking for has moved, been renamed, or never
            existed. No harm done — here is the way back.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="sheen group inline-flex items-center gap-2 rounded-pill bg-gradient-gold px-6 py-3 font-head text-sm font-bold text-bg transition-transform duration-500 ease-luxe hover:-translate-y-0.5"
            >
              Back to home
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center rounded-pill border border-gold/25 px-6 py-3 font-head text-sm font-bold text-fg-80 transition-colors duration-500 ease-luxe hover:border-gold/60 hover:text-white"
            >
              Talk to us
            </Link>
          </div>

          <nav
            aria-label="Site sections"
            className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-3"
          >
            {NAV_ROUTES.filter((r) => r.href !== '/').map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="font-head text-label uppercase text-white/35 transition-colors hover:text-gold"
              >
                {r.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}
