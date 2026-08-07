'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { User } from 'firebase/auth';
import {
  CalendarDays,
  Database,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  PanelsTopLeft,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { signIn, signOut, watchAuth } from '@/lib/admin';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/bookings', label: 'Discovery Requests', icon: CalendarDays },
  { href: '/admin/internships', label: 'Internships', icon: GraduationCap },
  { href: '/admin/blog', label: 'Blog Manager', icon: FileText },
  { href: '/admin/content', label: 'Page Content', icon: PanelsTopLeft },
  { href: '/admin/firestore', label: 'Firestore Viewer', icon: Database },
];

/**
 * Admin shell + auth gate.
 *
 * FIXES PLAN N9 — no flash of admin content. The legacy panel rendered the
 * whole CMS immediately and only then checked auth, so an unauthenticated
 * visitor briefly saw the interface. Here `checking` is the initial state and
 * nothing but a spinner renders until Firebase resolves.
 *
 * The real security boundary is Firestore Rules (plan N27), not this component.
 * Everything here is UI: it prevents a confusing experience, not a determined
 * attacker.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    return watchAuth((u) => {
      setUser(u);
      setChecking(false);
    });
  }, []);

  useEffect(() => setNavOpen(false), [pathname]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <Loader2 className="h-6 w-6 animate-spin text-gold" aria-hidden="true" />
        <span className="sr-only">Checking your session…</span>
      </div>
    );
  }

  if (!user) return <LoginForm />;

  return (
    <div className="min-h-screen bg-bg pt-[var(--nav-h)]">
      <div className="mx-auto flex w-full max-w-[1400px] gap-0 lg:gap-8 lg:px-6">
        {/* ── Sidebar ─────────────────────────────────── */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-[120] w-[264px] shrink-0 overflow-y-auto border-r border-gold/12 bg-bg-2 px-4 py-6 transition-transform duration-400 ease-luxe',
            'lg:sticky lg:top-[calc(var(--nav-h)+24px)] lg:z-auto lg:h-[calc(100vh-var(--nav-h)-48px)] lg:translate-x-0 lg:rounded-card lg:border lg:bg-bg-2/60',
            navOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="mb-6 flex items-center justify-between px-2">
            <span className="font-head text-[11px] font-bold uppercase tracking-[0.16em] text-gold">
              Admin
            </span>
            <button
              type="button"
              onClick={() => setNavOpen(false)}
              aria-label="Close menu"
              className="text-white/40 hover:text-white lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav aria-label="Admin sections" className="flex flex-col gap-1">
            {NAV.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-300',
                    active
                      ? 'bg-gold/12 font-semibold text-gold'
                      : 'text-white/50 hover:bg-white/[0.04] hover:text-white'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 border-t border-white/8 pt-5">
            <p className="truncate px-3 text-xs text-white/35" title={user.email ?? ''}>
              {user.email}
            </p>
            <button
              type="button"
              onClick={async () => {
                await signOut();
                toast.success('Signed out');
              }}
              className="mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/50 transition-colors hover:bg-white/[0.04] hover:text-white"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </aside>

        {navOpen && (
          <div
            role="presentation"
            onClick={() => setNavOpen(false)}
            className="fixed inset-0 z-[110] bg-black/70 lg:hidden"
          />
        )}

        {/* ── Content ─────────────────────────────────── */}
        <main className="min-w-0 flex-1 px-4 py-8 lg:px-0">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            className="mb-6 inline-flex items-center gap-2 rounded-pill border border-gold/25 px-4 py-2 font-head text-[11px] font-bold uppercase tracking-[0.1em] text-gold lg:hidden"
          >
            <Menu className="h-4 w-4" />
            Menu
          </button>

          {children}
        </main>
      </div>
    </div>
  );
}

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await signIn(email.trim(), password);
    } catch {
      // Deliberately generic — never reveal whether the address exists.
      setError('Those credentials were not accepted.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-24">
      <form
        onSubmit={onSubmit}
        className="glass-midnight w-full max-w-sm rounded-card p-7 sm:p-9"
      >
        <p className="eyebrow">Restricted</p>
        <h1 className="mt-4 font-head text-h2 font-bold">Admin sign in</h1>
        <p className="mt-2 text-sm text-fg-60">
          This area is for NexKeys staff only.
        </p>

        <div className="mt-7 space-y-4">
          <div>
            <label
              htmlFor="admin-email"
              className="mb-2 block font-head text-[13px] font-semibold text-white/85"
            >
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3.5 text-[15px] text-white outline-none transition-all duration-300 focus:border-gold"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="mb-2 block font-head text-[13px] font-semibold text-white/85"
            >
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3.5 text-[15px] text-white outline-none transition-all duration-300 focus:border-gold"
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="sheen mt-7 inline-flex w-full items-center justify-center gap-2 rounded-pill bg-gradient-gold px-6 py-3.5 font-head text-sm font-bold text-bg transition-transform duration-500 ease-luxe hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
