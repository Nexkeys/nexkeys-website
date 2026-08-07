'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  FileText,
  GraduationCap,
  Loader2,
  Rocket,
} from 'lucide-react';
import { toast } from 'sonner';

import { listBookings, listBlogPosts, type BookingRow, type BlogRow } from '@/lib/admin';
import { getHiringOpen, listApplications, setHiringOpen } from '@/lib/internship';
import { PROJECTS } from '@/lib/data/projects';
import type { InternshipApplication } from '@/lib/types';
import {
  AdminError,
  AdminHeader,
  AdminLoading,
  StatCard,
  StatusBadge,
  btnGhost,
} from '@/components/admin/ui';
import { cn } from '@/lib/utils';

/**
 * Dashboard (plan O10). The legacy panel opened straight into a raw bookings
 * table with no sense of what needed attention.
 */
export default function AdminDashboard() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [applications, setApplications] = useState<InternshipApplication[]>([]);
  const [posts, setPosts] = useState<BlogRow[]>([]);
  const [hiring, setHiring] = useState<boolean | null>(null);
  const [savingHiring, setSavingHiring] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [b, a, p, h] = await Promise.all([
        listBookings(50),
        listApplications(),
        listBlogPosts(50),
        getHiringOpen(),
      ]);
      setBookings(b);
      setApplications(a);
      setPosts(p);
      setHiring(h);
    } catch (err) {
      console.error('[admin] dashboard load failed:', err);
      setError(
        err instanceof Error ? err.message : 'Could not load the dashboard data.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleHiring = async () => {
    if (hiring === null) return;
    const next = !hiring;
    setHiring(next); // optimistic
    setSavingHiring(true);
    try {
      await setHiringOpen(next);
      toast.success(next ? 'Applications are OPEN' : 'Applications are CLOSED');
    } catch (err) {
      setHiring(!next); // roll back
      console.error('[admin] hiring toggle failed:', err);
      toast.error('Could not update the hiring state.');
    } finally {
      setSavingHiring(false);
    }
  };

  if (loading) return <AdminLoading label="Loading dashboard…" />;
  if (error) return <AdminError message={error} onRetry={load} />;

  const pendingBookings = bookings.filter((b) => b.status === 'confirmed').length;
  const newApplications = applications.filter((a) => a.status === 'pending').length;
  const liveProjects = PROJECTS.filter((p) => p.isLive).length;

  return (
    <>
      <AdminHeader
        title="Dashboard"
        description="What needs your attention today."
      />

      {/* ── Hiring toggle, front and centre (plan §9.3) ──── */}
      <div className="mb-8 flex flex-col gap-4 rounded-card border border-gold/20 bg-gradient-midnight-gold p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-head text-[10px] font-bold uppercase tracking-[0.14em] text-gold">
            Internship Applications
          </p>
          <p className="mt-2 font-head text-h3 font-bold text-white">
            {hiring ? 'Currently accepting applications' : 'Applications are closed'}
          </p>
          <p className="mt-1 text-sm text-fg-60">
            This drives the public /internship page in real time.
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={!!hiring}
          onClick={toggleHiring}
          disabled={savingHiring}
          className={cn(
            'relative inline-flex h-11 w-20 shrink-0 items-center rounded-pill border transition-colors duration-400',
            hiring ? 'border-gold bg-gold/25' : 'border-white/20 bg-white/[0.06]'
          )}
        >
          <span className="sr-only">Toggle hiring</span>
          <span
            aria-hidden="true"
            className={cn(
              'ml-1 inline-flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-400 ease-luxe',
              hiring ? 'translate-x-9 bg-gradient-gold' : 'translate-x-0 bg-white/30'
            )}
          >
            {savingHiring && <Loader2 className="h-3.5 w-3.5 animate-spin text-bg" />}
          </span>
        </button>
      </div>

      {/* ── KPIs ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Pending Calls"
          value={pendingBookings}
          hint={`${bookings.length} total bookings`}
          icon={<CalendarDays className="h-4 w-4 text-gold/50" aria-hidden="true" />}
        />
        <StatCard
          label="New Applications"
          value={newApplications}
          hint={`${applications.length} total applicants`}
          icon={<GraduationCap className="h-4 w-4 text-gold/50" aria-hidden="true" />}
        />
        <StatCard
          label="Published Posts"
          value={posts.length}
          icon={<FileText className="h-4 w-4 text-gold/50" aria-hidden="true" />}
        />
        <StatCard
          label="Live Projects"
          value={liveProjects}
          hint={`${PROJECTS.length} in the portfolio`}
          icon={<Rocket className="h-4 w-4 text-gold/50" aria-hidden="true" />}
        />
      </div>

      {/* ── Recent activity ──────────────────────────────── */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-card border border-gold/12 bg-bg-2 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-head text-sm font-bold text-white">Latest bookings</h2>
            <Link href="/admin/bookings" className={cn(btnGhost, 'px-3 py-1.5')}>
              View all
            </Link>
          </div>

          {bookings.length === 0 ? (
            <p className="py-8 text-center text-sm text-fg-40">No bookings yet.</p>
          ) : (
            <ul className="divide-y divide-white/6">
              {bookings.slice(0, 5).map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-white">{b.name}</p>
                    <p className="truncate text-xs text-white/40">
                      {b.dateString} · {b.time}
                    </p>
                  </div>
                  <StatusBadge status={b.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-card border border-gold/12 bg-bg-2 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-head text-sm font-bold text-white">Latest applicants</h2>
            <Link href="/admin/internships" className={cn(btnGhost, 'px-3 py-1.5')}>
              View all
            </Link>
          </div>

          {applications.length === 0 ? (
            <p className="py-8 text-center text-sm text-fg-40">No applications yet.</p>
          ) : (
            <ul className="divide-y divide-white/6">
              {applications.slice(0, 5).map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-white">{a.fullName}</p>
                    <p className="truncate text-xs text-white/40">{a.track}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
