import type { Metadata, Viewport } from 'next';
import { Bebas_Neue, Syne, DM_Sans } from 'next/font/google';
import { Toaster } from 'sonner';

import './globals.css';

import { LenisProvider } from '@/components/providers/lenis-provider';
import { LiquidNav } from '@/components/nav/liquid-nav';
import { SiteFooter } from '@/components/shared/site-footer';
import { CustomCursor } from '@/components/shared/custom-cursor';
import { ScrollToTop } from '@/components/shared/scroll-to-top';
import { CookieConsent } from '@/components/shared/cookie-consent';
import { SITE } from '@/lib/data/team';

/* Self-hosted via next/font — no render-blocking <link>, zero CLS (plan O30) */
const bebas = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const syne = Syne({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-head',
  display: 'swap',
});

const dmSans = DM_Sans({
  weight: ['300', '400', '500'],
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: 'NexKeys Agency — Software Solutions for Growing Businesses',
    template: '%s · NexKeys Agency',
  },
  description: SITE.description,
  keywords: [
    'software agency Nigeria',
    'web development Lagos',
    'mobile app development',
    'UI UX design',
    'AI automation',
    'outsourced IT partner',
  ],
  authors: [{ name: SITE.legalName }],
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: SITE.url,
    siteName: SITE.legalName,
    title: 'NexKeys Agency — Software Solutions for Growing Businesses',
    description: SITE.description,
    images: [{ url: '/images/brand/hero-graphic.png', width: 1200, height: 630, alt: SITE.legalName }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@nexkeysagency',
    title: 'NexKeys Agency',
    description: SITE.description,
    images: ['/images/brand/hero-graphic.png'],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: SITE.url },
};

export const viewport: Viewport = {
  themeColor: '#050508',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${bebas.variable} ${syne.variable} ${dmSans.variable}`}
      suppressHydrationWarning
    >
      <body className="grain">
        <a
          href="#main"
          className="sr-only rounded-pill bg-gold px-5 py-2.5 font-head text-sm font-bold text-bg focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[999]"
        >
          Skip to content
        </a>

        <LenisProvider>
          <CustomCursor />
          <LiquidNav />

          <main id="main">{children}</main>

          <SiteFooter />
          <ScrollToTop />
          <CookieConsent />
        </LenisProvider>

        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'linear-gradient(135deg,#E8BC2C,#C9A227)',
              color: '#050508',
              border: 'none',
              fontFamily: 'var(--font-head)',
              fontWeight: 700,
            },
          }}
        />
      </body>
    </html>
  );
}
