/**
 * ROUTE MANIFEST — the single source of truth for every URL on the site.
 *
 * WHY THIS FILE EXISTS
 * The legacy site (and the first pass of this rebuild) hard-coded link targets
 * in the navbar, the footer and inline `<Link>`s independently. The result was
 * a navbar that pointed at `/work`, `/about` and `/blog` while none of those
 * routes existed — every one of them a 404 the moment a visitor clicked it.
 *
 * Nav, footer, sitemap and breadcrumbs all read from THIS array. A link cannot
 * be added to the UI without a route existing here, and `npm run check:routes`
 * asserts that every entry has a matching `app/**` page on disk.
 */

export type RouteGroup = 'primary' | 'legal' | 'system';

export interface RouteDef {
  /** URL path. Must match a directory under app/. */
  href: string;
  /** Nav / footer label. */
  label: string;
  /** Longer label used in the footer where there is room. */
  footerLabel?: string;
  group: RouteGroup;
  /** Show in the primary navbar. */
  inNav?: boolean;
  /** Show in the footer column. */
  inFooter?: boolean;
  /** Include in sitemap.xml. */
  inSitemap?: boolean;
  /** sitemap.xml priority. */
  priority?: number;
  changeFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export const ROUTES: RouteDef[] = [
  {
    href: '/',
    label: 'Home',
    group: 'primary',
    inNav: true,
    inSitemap: true,
    priority: 1.0,
    changeFrequency: 'monthly',
  },
  {
    href: '/work',
    label: 'Projects',
    footerLabel: 'Case Studies',
    group: 'primary',
    inNav: true,
    inFooter: true,
    inSitemap: true,
    priority: 0.9,
    changeFrequency: 'monthly',
  },
  {
    href: '/about',
    label: 'About',
    group: 'primary',
    inNav: true,
    inFooter: true,
    inSitemap: true,
    priority: 0.8,
    changeFrequency: 'monthly',
  },
  {
    href: '/internship',
    label: 'Internship',
    group: 'primary',
    inNav: true,
    inFooter: true,
    inSitemap: true,
    priority: 0.8,
    changeFrequency: 'weekly',
  },
  {
    href: '/blog',
    label: 'Blog',
    group: 'primary',
    inNav: true,
    inFooter: true,
    inSitemap: true,
    priority: 0.8,
    changeFrequency: 'daily',
  },
  {
    href: '/contact',
    label: 'Contact',
    group: 'primary',
    inFooter: true,
    inSitemap: true,
    priority: 0.9,
    changeFrequency: 'monthly',
  },
  {
    href: '/privacy',
    label: 'Privacy Policy',
    group: 'legal',
    inFooter: true,
    inSitemap: true,
    priority: 0.3,
    changeFrequency: 'yearly',
  },
  {
    href: '/terms',
    label: 'Terms of Service',
    group: 'legal',
    inFooter: true,
    inSitemap: true,
    priority: 0.3,
    changeFrequency: 'yearly',
  },
  {
    href: '/legal',
    label: 'Legal Notice',
    group: 'legal',
    inFooter: true,
    inSitemap: true,
    priority: 0.3,
    changeFrequency: 'yearly',
  },
  {
    /* Private CMS — deliberately excluded from nav, footer and sitemap,
       and disallowed in robots.txt. */
    href: '/admin',
    label: 'Admin',
    group: 'system',
  },
];

export const NAV_ROUTES = ROUTES.filter((r) => r.inNav);
export const FOOTER_ROUTES = ROUTES.filter((r) => r.inFooter && r.group === 'primary');
export const LEGAL_ROUTES = ROUTES.filter((r) => r.group === 'legal');
export const SITEMAP_ROUTES = ROUTES.filter((r) => r.inSitemap);

export const ROUTE_BY_HREF = Object.fromEntries(
  ROUTES.map((r) => [r.href, r])
) as Record<string, RouteDef>;

/** True for the active route, treating nested paths as belonging to the parent. */
export function isActiveRoute(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}
