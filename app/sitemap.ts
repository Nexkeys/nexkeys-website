import type { MetadataRoute } from 'next';
import { SITEMAP_ROUTES } from '@/lib/data/routes';
import { SITE } from '@/lib/data/team';

/**
 * sitemap.xml (plan O4) — generated from the route manifest, so a new route is
 * indexed the moment it is registered. `/admin` is excluded by virtue of not
 * carrying `inSitemap`.
 *
 * Blog posts are appended in Phase 5, once `/blog/[slug]` exists.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return SITEMAP_ROUTES.map((route) => ({
    url: `${SITE.url}${route.href === '/' ? '' : route.href}`,
    lastModified: now,
    changeFrequency: route.changeFrequency ?? 'monthly',
    priority: route.priority ?? 0.5,
  }));
}
