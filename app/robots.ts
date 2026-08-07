import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/data/team';

/** robots.txt (plan O4). The CMS is kept out of the index. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/'],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
