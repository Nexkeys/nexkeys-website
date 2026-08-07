'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── Page header ────────────────────────────────────────── */
export function AdminHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-head text-h2 font-bold text-white">{title}</h1>
        {description && <p className="mt-2 text-sm text-fg-60">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/* ── KPI tile ───────────────────────────────────────────── */
export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-card border border-gold/12 bg-bg-2 p-5">
      <div className="flex items-center justify-between">
        <span className="font-head text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
          {label}
        </span>
        {icon}
      </div>
      <p className="mt-3 font-display text-[38px] leading-none text-gradient-gold">
        {value}
      </p>
      {hint && <p className="mt-2 text-xs text-white/35">{hint}</p>}
    </div>
  );
}

/* ── Status badge ───────────────────────────────────────── */
const STATUS_TONE: Record<string, string> = {
  confirmed: 'border-status-live/40 bg-status-live/10 text-status-live',
  completed: 'border-status-success/40 bg-status-success/10 text-status-success',
  cancelled: 'border-destructive/40 bg-destructive/10 text-destructive',
  pending: 'border-gold/40 bg-gold/10 text-gold',
  shortlisted: 'border-status-info/40 bg-status-info/10 text-status-info',
  accepted: 'border-status-success/40 bg-status-success/10 text-status-success',
  rejected: 'border-destructive/40 bg-destructive/10 text-destructive',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-pill border px-2.5 py-0.5 font-head text-[10px] font-bold uppercase tracking-[0.1em]',
        STATUS_TONE[status] ?? 'border-white/20 bg-white/5 text-white/60'
      )}
    >
      {status}
    </span>
  );
}

/* ── Loading / empty ────────────────────────────────────── */
export function AdminLoading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-card border border-gold/12 bg-bg-2 py-20 text-sm text-fg-60">
      <Loader2 className="h-4 w-4 animate-spin text-gold" aria-hidden="true" />
      {label}
    </div>
  );
}

export function AdminEmpty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-card border border-gold/12 bg-bg-2 py-20 text-center">
      <p className="font-head text-base font-bold text-white">{title}</p>
      {hint && <p className="mx-auto mt-2 max-w-sm text-sm text-fg-60">{hint}</p>}
    </div>
  );
}

export function AdminError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="rounded-card border border-destructive/30 bg-destructive/[0.07] p-6"
    >
      <p className="flex items-center gap-2 font-head text-sm font-bold text-destructive">
        <AlertTriangle className="h-4 w-4" aria-hidden="true" />
        Something went wrong
      </p>
      <p className="mt-2 text-sm text-fg-60">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-pill border border-gold/25 px-4 py-2 font-head text-[11px] font-bold uppercase tracking-[0.1em] text-gold hover:border-gold/60"
        >
          Try again
        </button>
      )}
    </div>
  );
}

/* ── Buttons ────────────────────────────────────────────── */
export const btnPrimary =
  'sheen inline-flex items-center justify-center gap-2 rounded-pill bg-gradient-gold px-5 py-2.5 font-head text-[12px] font-bold uppercase tracking-[0.1em] text-bg transition-transform duration-500 ease-luxe hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60';

export const btnGhost =
  'inline-flex items-center justify-center gap-2 rounded-pill border border-gold/25 px-5 py-2.5 font-head text-[12px] font-bold uppercase tracking-[0.1em] text-fg-80 transition-colors duration-400 hover:border-gold/60 hover:text-white disabled:pointer-events-none disabled:opacity-50';

export const btnDanger =
  'inline-flex items-center justify-center gap-2 rounded-pill border border-destructive/40 px-5 py-2.5 font-head text-[12px] font-bold uppercase tracking-[0.1em] text-destructive transition-colors duration-400 hover:bg-destructive/10 disabled:pointer-events-none disabled:opacity-50';

export const adminInput =
  'w-full rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-all duration-300 placeholder:text-fg-40 focus:border-gold';

export const adminLabel =
  'mb-2 block font-head text-[12px] font-semibold text-white/85';

/* ── Confirm dialog ─────────────────────────────────────── */
/**
 * Explicit confirmation for destructive actions (plan §9.2 #7).
 *
 * The legacy admin used the native `confirm()` at best, and in places nothing
 * at all — `deleteDocument()` wrote straight through. A real dialog also lets
 * us name exactly what is about to be destroyed.
 */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = 'Delete',
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      <div
        role="presentation"
        onClick={onCancel}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-body"
        className="relative w-full max-w-md rounded-card border border-destructive/30 bg-bg-2 p-6"
      >
        <h2 id="confirm-title" className="font-head text-h3 font-bold text-white">
          {title}
        </h2>
        <p id="confirm-body" className="mt-3 text-sm text-fg-60">
          {body}
        </p>
        <div className="mt-7 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className={btnGhost} disabled={busy}>
            Cancel
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={btnDanger}
          >
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Wires up the open/target state for a confirm flow. */
export function useConfirm<T>() {
  const [target, setTarget] = useState<T | null>(null);
  const [busy, setBusy] = useState(false);

  return {
    target,
    busy,
    ask: (t: T) => setTarget(t),
    cancel: () => setTarget(null),
    run: async (fn: (t: T) => Promise<void>) => {
      if (target === null) return;
      setBusy(true);
      try {
        await fn(target);
        setTarget(null);
      } finally {
        setBusy(false);
      }
    },
  };
}

/**
 * Table that becomes a card list on small screens (plan §9.2 #9).
 * The legacy admin let tables overflow the viewport on mobile.
 */
export function TableWrap({ children }: { children: ReactNode }) {
  return (
    <div className="scroll-x rounded-card border border-gold/12 bg-bg-2">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        {children}
      </table>
    </div>
  );
}

export function Th({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={cn(
        'whitespace-nowrap border-b border-gold/15 bg-gold/[0.05] px-4 py-3 font-head text-[10px] font-bold uppercase tracking-[0.12em] text-gold',
        className
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <td className={cn('border-b border-white/6 px-4 py-3 align-top text-fg-80', className)}>
      {children}
    </td>
  );
}
