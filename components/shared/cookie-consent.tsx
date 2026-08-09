'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';

import { getConsent, setConsent, type ConsentChoice } from '@/lib/consent';

/**
 * Cookie consent banner.
 *
 * Offers a genuine choice: Accept and Reject are the same size, sit side by
 * side, and take one click each. Making "reject" harder than "accept" — buried
 * in a settings sub-panel, or styled as a faint text link — is a dark pattern
 * and is explicitly non-compliant under GDPR, which the NDPR mirrors.
 *
 * The copy no longer says "by continuing you agree". Consent-by-continuing is
 * not valid consent once a reject option exists, and it would contradict the
 * button sitting next to it.
 */
export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Any prior answer — accepted OR rejected — means do not ask again.
    if (getConsent() !== null) return;

    const t = setTimeout(() => !cancelled && setShow(true), 1400);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, []);

  const choose = (choice: ConsentChoice) => {
    setConsent(choice);
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          role="dialog"
          aria-label="Cookie consent"
          initial={{ y: '110%' }}
          animate={{ y: 0 }}
          exit={{ y: '110%' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-0 bottom-0 z-[95] border-t border-gold/15 bg-bg-2/95 px-5 py-4 backdrop-blur-xl"
        >
          <div className="container flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-body-sm text-fg-60">
              We use cookies to understand how this site is used. Essential
              cookies are always on; everything else is up to you.{' '}
              <Link
                href="/privacy"
                className="font-semibold text-gold hover:text-gold-light"
              >
                Learn more
              </Link>
            </p>

            {/* Both actions are the same size and one click each — a reject
                that is harder to reach than accept is not a real choice. */}
            <div className="flex w-full shrink-0 flex-col gap-2.5 xs:flex-row sm:w-auto">
              <button
                type="button"
                onClick={() => choose('rejected')}
                className="w-full rounded-pill border border-gold/30 px-7 py-2.5 font-head text-sm font-bold text-fg-80 transition-colors duration-300 hover:border-gold/60 hover:text-white xs:w-auto"
              >
                Reject
              </button>

              <button
                type="button"
                onClick={() => choose('accepted')}
                className="w-full rounded-pill bg-gradient-gold px-7 py-2.5 font-head text-sm font-bold text-bg transition-transform duration-300 hover:-translate-y-0.5 xs:w-auto"
              >
                Accept
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
