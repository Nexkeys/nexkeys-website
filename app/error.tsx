'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RotateCw } from 'lucide-react';

/**
 * Route-level error boundary (plan O20).
 *
 * Must be a client component and must accept `reset` — Next calls it to
 * re-render the segment without a full page reload.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaced in the browser console and captured by the hosting platform's
    // runtime logs. `digest` is the server-side correlation id.
    console.error('[nexkeys] route error', error);
  }, [error]);

  return (
    <section className="relative flex min-h-[78vh] items-center overflow-hidden ground-midnight py-section">
      <div
        aria-hidden="true"
        className="grid-overlay pointer-events-none absolute inset-0 -z-10"
      />

      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow justify-center">Something broke</p>

          <h1 className="mt-5 font-display text-display-lg text-gradient-gold">
            That didn&apos;t load
          </h1>

          <p className="mx-auto mt-5 max-w-md text-body-lg text-fg-60">
            An unexpected error interrupted this page. Trying again usually
            clears it.
          </p>

          {error.digest && (
            <p className="mt-4 font-mono text-xs text-white/25">
              Reference: {error.digest}
            </p>
          )}

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="sheen group inline-flex items-center gap-2 rounded-pill bg-gradient-gold px-6 py-3 font-head text-sm font-bold text-bg transition-transform duration-500 ease-luxe hover:-translate-y-0.5"
            >
              <RotateCw className="h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex items-center rounded-pill border border-gold/25 px-6 py-3 font-head text-sm font-bold text-fg-80 transition-colors duration-500 ease-luxe hover:border-gold/60 hover:text-white"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
