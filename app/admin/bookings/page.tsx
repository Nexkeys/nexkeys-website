'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  deleteBooking,
  downloadCsv,
  listBookings,
  toCsv,
  updateBookingStatus,
  type BookingRow,
} from '@/lib/admin';
import type { Booking } from '@/lib/types';
import {
  AdminEmpty,
  AdminError,
  AdminHeader,
  AdminLoading,
  ConfirmDialog,
  StatusBadge,
  Td,
  Th,
  TableWrap,
  adminInput,
  btnGhost,
  useConfirm,
} from '@/components/admin/ui';
import { cn } from '@/lib/utils';

const STATUSES: Booking['status'][] = ['confirmed', 'completed', 'cancelled'];

export default function AdminBookingsPage() {
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [term, setTerm] = useState('');
  const [filter, setFilter] = useState<'all' | Booking['status']>('all');

  const confirm = useConfirm<BookingRow>();

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setRows(await listBookings(200));
    } catch (err) {
      console.error('[admin] bookings load failed:', err);
      setError(err instanceof Error ? err.message : 'Could not load bookings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = term.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter !== 'all' && r.status !== filter) return false;
      if (!q) return true;
      return (
        r.name?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.phone?.toLowerCase().includes(q) ||
        r.dateString?.includes(q)
      );
    });
  }, [rows, term, filter]);

  /* Optimistic status change with rollback (plan §9.3). */
  const changeStatus = async (row: BookingRow, status: Booking['status']) => {
    const previous = row.status;
    setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, status } : r)));
    try {
      await updateBookingStatus(row.id, status);
      toast.success(`Marked ${status}`);
    } catch (err) {
      setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, status: previous } : r)));
      console.error('[admin] status update failed:', err);
      toast.error('Could not update the status.');
    }
  };

  const exportCsv = () => {
    downloadCsv(
      `nexkeys-bookings-${new Date().toISOString().slice(0, 10)}.csv`,
      toCsv(filtered as unknown as Record<string, unknown>[], [
        'name',
        'email',
        'phone',
        'dateString',
        'time',
        'timezone',
        'status',
        'notes',
      ])
    );
  };

  return (
    <>
      <AdminHeader
        title="Discovery Requests"
        description="Every booked call, newest first."
        actions={
          <button type="button" onClick={exportCsv} className={btnGhost}>
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30"
          />
          <input
            type="search"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search name, email, phone or date…"
            aria-label="Search bookings"
            className={cn(adminInput, 'pl-11')}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {(['all', ...STATUSES] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              aria-pressed={filter === s}
              className={cn(
                'rounded-pill border px-4 py-2 font-head text-[11px] font-bold uppercase tracking-[0.1em] transition-colors',
                filter === s
                  ? 'border-gold bg-gold/15 text-gold'
                  : 'border-white/12 text-white/45 hover:border-gold/40 hover:text-white'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <AdminLoading label="Loading bookings…" />
      ) : error ? (
        <AdminError message={error} onRetry={load} />
      ) : filtered.length === 0 ? (
        <AdminEmpty
          title="No bookings match"
          hint="Try clearing the search or the status filter."
        />
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Contact</Th>
              <Th>When</Th>
              <Th>Notes</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-white/[0.02]">
                <Td>
                  <span className="font-semibold text-white">{row.name}</span>
                </Td>
                <Td>
                  <a
                    href={`mailto:${row.email}`}
                    className="block text-gold hover:underline"
                  >
                    {row.email}
                  </a>
                  {row.phone && (
                    <span className="block text-xs text-white/40">{row.phone}</span>
                  )}
                </Td>
                <Td>
                  <span className="whitespace-nowrap">{row.dateString}</span>
                  <span className="block text-xs text-white/40">
                    {row.time}
                    {row.timezone ? ` · ${row.timezone}` : ''}
                  </span>
                </Td>
                <Td className="max-w-[260px]">
                  <span className="line-clamp-2 text-xs text-white/50">
                    {row.notes || '—'}
                  </span>
                </Td>
                <Td>
                  <StatusBadge status={row.status} />
                </Td>
                <Td>
                  <div className="flex items-center justify-end gap-2">
                    <select
                      value={row.status}
                      onChange={(e) =>
                        changeStatus(row, e.target.value as Booking['status'])
                      }
                      aria-label={`Change status for ${row.name}`}
                      className="rounded-lg border border-white/12 bg-white/[0.04] px-2 py-1.5 text-xs text-white outline-none focus:border-gold"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s} className="bg-bg-2">
                          {s}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => confirm.ask(row)}
                      aria-label={`Delete booking for ${row.name}`}
                      className="rounded-lg p-2 text-white/35 transition-colors hover:bg-destructive/10 hover:text-destructive"
                      style={{ minHeight: 'auto' }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}

      <ConfirmDialog
        open={confirm.target !== null}
        busy={confirm.busy}
        title="Delete this booking?"
        body={`The booking for ${confirm.target?.name ?? ''} on ${
          confirm.target?.dateString ?? ''
        } will be permanently removed. This cannot be undone, and it does not free the time slot.`}
        onCancel={confirm.cancel}
        onConfirm={() =>
          confirm.run(async (row) => {
            try {
              await deleteBooking(row.id);
              setRows((rs) => rs.filter((r) => r.id !== row.id));
              toast.success('Booking deleted');
            } catch (err) {
              console.error('[admin] delete failed:', err);
              toast.error('Could not delete the booking.');
            }
          })
        }
      />
    </>
  );
}
