import type { Metadata } from 'next';
import { AdminShell } from '@/components/admin/admin-shell';

/**
 * The CMS is never indexed. `robots.ts` also disallows /admin, and the route
 * is deliberately absent from the nav, footer and sitemap.
 */
export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
