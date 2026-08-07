'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';

const STORAGE_KEY = 'cookieConsent';

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let cancelled = false;
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      // Storage blocked (private mode) — don't nag.
      return;
    }
    const t = setTimeout(() => !cancelled && setShow(true), 1400);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      /* ignore */
    }
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
              We use cookies to enhance your experience. By continuing to visit this site you
              agree to our use of cookies.{' '}
              <Link href="/privacy" className="font-semibold text-gold hover:text-gold-light">
                Learn more
              </Link>
            </p>
            <button
              type="button"
              onClick={accept}
              className="w-full shrink-0 rounded-pill bg-gradient-gold px-7 py-2.5 font-head text-sm font-bold text-bg transition-transform duration-300 hover:-translate-y-0.5 sm:w-auto"
            >
              Accept
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
