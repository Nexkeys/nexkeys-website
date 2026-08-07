'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';
import { NAV_LINKS } from '@/lib/data/team';
import { Magnetic } from '@/components/motion/magnetic';
import { useCapabilities } from '@/hooks/use-capabilities';
import { cn } from '@/lib/utils';

/**
 * LIQUID NAVBAR
 * ─────────────────────────────────────────────────────────────
 * · Gooey blob indicator that MORPHS between links (SVG filter:
 *   heavy blur + high-contrast alpha matrix = liquid merge).
 * · Spring-driven `layoutId` pill so the blob stretches as it travels.
 * · Glass that thickens the further you scroll.
 * · HIDDEN NAVIGATION — retracts on scroll-down, returns on scroll-up.
 *   Keeps the viewport cinematic and gives content the full frame.
 * · Mobile: morphs into a full-screen panel with staggered links.
 */
export function LiquidNav() {
  const pathname = usePathname();
  const { reduced } = useCapabilities();

  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  const { scrollY } = useScroll();
  const lastY = useRef(0);

  useMotionValueEvent(scrollY, 'change', (y) => {
    setScrolled(y > 24);

    // Hidden navigation — only once past the hero, never while the menu is open.
    const delta = y - lastY.current;
    if (!mobileOpen && y > 480 && Math.abs(delta) > 6) {
      setHidden(delta > 0);
    } else if (y <= 480) {
      setHidden(false);
    }
    lastY.current = y;
  });

  // Lock body scroll while the mobile panel is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // Close the panel on navigation.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Escape closes the panel.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMobileOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  /** The link the blob should sit under: hovered wins, else the active route. */
  const blobTarget = hovered ?? NAV_LINKS.find((l) => isActive(l.href))?.href ?? null;

  return (
    <>
      {/* Gooey filter — the ingredient that makes the indicator feel liquid */}
      <svg className="pointer-events-none absolute h-0 w-0" aria-hidden="true">
        <defs>
          <filter id="nk-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      <motion.header
        initial={false}
        animate={{ y: hidden ? '-120%' : '0%' }}
        transition={
          reduced
            ? { duration: 0 }
            : { type: 'spring', stiffness: 260, damping: 32, mass: 0.7 }
        }
        className="fixed inset-x-0 top-0 z-[100]"
      >
        <div
          className={cn(
            'transition-[background,backdrop-filter,box-shadow,border-color] duration-500 ease-luxe',
            scrolled
              ? 'border-b border-gold/15 bg-[rgba(5,5,8,0.72)] shadow-[0_1px_0_rgba(201,162,39,0.18)] backdrop-blur-2xl backdrop-saturate-150'
              : 'border-b border-transparent bg-transparent'
          )}
        >
          <nav
            aria-label="Main navigation"
            className="container flex h-nav items-center justify-between gap-3 sm:gap-6"
          >
            {/* Wordmark */}
            <Link
              href="/"
              aria-label="NexKeys — home"
              /* `min-w-0` + `truncate` let the wordmark yield space instead of
                 forcing the bar wider than the viewport. The 44px hamburger is
                 a fixed tap target, so the logo is what has to give. */
              className="flex min-h-11 min-w-0 items-center truncate text-logo-split font-head text-base font-extrabold tracking-tight xxs:text-lg sm:text-xl"
            >
              NexKeys
            </Link>

            {/* Desktop links + liquid blob */}
            <ul
              className="relative hidden items-center gap-1 md:flex"
              style={{ filter: reduced ? undefined : 'url(#nk-goo)' }}
              onMouseLeave={() => setHovered(null)}
            >
              {NAV_LINKS.map((link) => {
                const active = isActive(link.href);
                const showBlob = blobTarget === link.href;

                return (
                  <li key={link.href} className="relative">
                    <Link
                      href={link.href}
                      onMouseEnter={() => setHovered(link.href)}
                      onFocus={() => setHovered(link.href)}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        /* `min-h-11` = 44px, the accessible tap-target floor.
                           py-2 alone rendered these at 36px. */
                        'relative z-10 flex min-h-11 items-center rounded-pill px-4 font-head text-sm font-medium transition-colors duration-300',
                        active || showBlob ? 'text-white' : 'text-fg-60 hover:text-white'
                      )}
                    >
                      {link.label}
                    </Link>

                    {showBlob && !reduced && (
                      <motion.span
                        layoutId="nk-nav-blob"
                        aria-hidden="true"
                        className="absolute inset-0 rounded-pill bg-gold/20"
                        transition={{
                          type: 'spring',
                          stiffness: 320,
                          damping: 28,
                          mass: 0.6,
                        }}
                      />
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Desktop CTA */}
            <div className="hidden md:block">
              <Magnetic>
                <Link
                  href="/contact"
                  className="sheen group inline-flex min-h-11 items-center gap-2 rounded-pill bg-gradient-gold px-5 py-2.5 font-head text-sm font-bold text-bg shadow-gold transition-shadow duration-300 hover:shadow-gold-lg"
                >
                  Let&apos;s Talk
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Magnetic>
            </div>

            {/* Mobile trigger */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-expanded={mobileOpen}
              aria-controls="nk-mobile-panel"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              className="relative z-[120] grid h-11 w-11 place-items-center rounded-full border border-gold/20 bg-white/[0.03] text-white backdrop-blur-md transition-colors hover:border-gold/45 md:hidden"
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.span
                    key="x"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-5 w-5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </nav>
        </div>
      </motion.header>

      {/* Mobile panel */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="nk-mobile-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, clipPath: 'circle(0% at 100% 0%)' }}
            animate={{ opacity: 1, clipPath: 'circle(150% at 100% 0%)' }}
            exit={{ opacity: 0, clipPath: 'circle(0% at 100% 0%)' }}
            transition={{ duration: reduced ? 0 : 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[110] flex flex-col items-center justify-center gap-2 bg-[rgba(5,5,8,0.97)] backdrop-blur-2xl md:hidden"
          >
            <div className="grid-overlay pointer-events-none absolute inset-0" aria-hidden />

            <nav aria-label="Mobile menu" className="relative w-full px-8">
              <ul className="flex flex-col items-center gap-1">
                {NAV_LINKS.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: reduced ? 0 : 0.12 + i * 0.07,
                      duration: 0.5,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="w-full"
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        'block w-full py-3 text-center font-head text-4xl font-extrabold transition-colors',
                        isActive(link.href) ? 'text-gradient-gold' : 'text-fg-60'
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduced ? 0 : 0.5, duration: 0.5 }}
              className="relative mt-8"
            >
              <Link
                href="/contact"
                className="inline-flex min-h-11 items-center gap-2 rounded-pill bg-gradient-gold px-10 py-4 font-head text-base font-bold text-bg shadow-gold"
              >
                Let&apos;s Talk
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
