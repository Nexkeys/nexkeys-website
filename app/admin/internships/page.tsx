'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, MessageCircle, Search, X } from 'lucide-react';
import { toast } from 'sonner';

import { downloadCsv, toCsv } from '@/lib/admin';
import { listApplications, updateApplicantStatus } from '@/lib/internship';
import { TRACKS, TRACK_SHORT_LABEL } from '@/lib/data/tracks';
import { COUNTRY_BY_CODE, flagEmoji } from '@/lib/data/countries';
import type { ApplicationStatus, InternshipApplication } from '@/lib/types';
import {
  AdminEmpty,
  AdminError,
  AdminHeader,
  AdminLoading,
  StatusBadge,
  Td,
  Th,
  TableWrap,
  adminInput,
  btnGhost,
} from '@/components/admin/ui';
import { cn } from '@/lib/utils';

const STATUSES: ApplicationStatus[] = ['pending', 'shortlisted', 'accepted', 'rejected'];

/** Digits only — what wa.me expects. */
function waLink(whatsapp: string): string {
  return `https://wa.me/${whatsapp.replace(/\D/g, '')}`;
}

/**
 * Renders the applicant's number with their country.
 *
 * Applications submitted before the form went global have no `whatsappCountry`,
 * so the flag is simply omitted rather than guessed — showing the wrong flag
 * would be worse than showing none.
 */
function PhoneCell({ app }: { app: InternshipApplication }) {
  const country = app.whatsappCountry ? COUNTRY_BY_CODE[app.whatsappCountry] : undefined;

  return (
    <div className="flex items-center gap-2">
      {app.whatsappCountry && (
        <span
          aria-hidden="true"
          title={country?.name ?? app.whatsappCountry}
          className="text-base leading-none"
        >
          {flagEmoji(app.whatsappCountry)}
        </span>
      )}
      <div className="min-w-0">
        <a
          href={waLink(app.whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          className="block whitespace-nowrap text-gold hover:underline"
        >
          {app.whatsapp}
        </a>
        {country && (
          <span className="block text-[11px] text-white/35">{country.name}</span>
        )}
      </div>
    </div>
  );
}

export default function AdminInternshipsPage() {
  const [rows, setRows] = useState<InternshipApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [term, setTerm] = useState('');
  const [track, setTrack] = useState('all');
  const [status, setStatus] = useState<'all' | ApplicationStatus>('all');
  const [viewing, setViewing] = useState<InternshipApplication | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setRows(await listApplications());
    } catch (err) {
      console.error('[admin] applications load failed:', err);
      setError(err instanceof Error ? err.message : 'Could not load applications.');
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
      // `track` stores the display NAME, not the id — legacy contract (§17.4).
      if (track !== 'all' && r.track !== track) return false;
      if (status !== 'all' && r.status !== status) return false;
      if (!q) return true;
      return (
        r.fullName?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.whatsapp?.toLowerCase().includes(q) ||
        r.location?.toLowerCase().includes(q)
      );
    });
  }, [rows, term, track, status]);

  const changeStatus = async (app: InternshipApplication, next: ApplicationStatus) => {
    if (!app.id) return;
    const previous = app.status;
    setRows((rs) => rs.map((r) => (r.id === app.id ? { ...r, status: next } : r)));
    try {
      await updateApplicantStatus(app.id, next);
      toast.success(`Marked ${next}`);
    } catch (err) {
      setRows((rs) => rs.map((r) => (r.id === app.id ? { ...r, status: previous } : r)));
      console.error('[admin] status update failed:', err);
      toast.error('Could not update the status.');
    }
  };

  const exportCsv = () => {
    downloadCsv(
      `nexkeys-applicants-${new Date().toISOString().slice(0, 10)}.csv`,
      toCsv(filtered as unknown as Record<string, unknown>[], [
        'fullName',
        'email',
        'whatsapp',
        'whatsappCountry',
        'whatsappDialCode',
        'location',
        'track',
        'preferredSchedule',
        'exactSyncHour',
        'screeningAnswer',
        'status',
      ])
    );
  };

  return (
    <>
      <AdminHeader
        title="Internship Applications"
        description={`${rows.length} applicant${rows.length === 1 ? '' : 's'} across ${
          TRACKS.length
        } tracks.`}
        actions={
          <button type="button" onClick={exportCsv} className={btnGhost}>
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        }
      />

      {/* ── Filters ──────────────────────────────────────── */}
      <div className="mb-5 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30"
            />
            <input
              type="search"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search name, email, number or location…"
              aria-label="Search applicants"
              className={cn(adminInput, 'pl-11')}
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            aria-label="Filter by status"
            className={cn(adminInput, 'sm:w-44')}
          >
            <option value="all" className="bg-bg-2">
              All statuses
            </option>
            {STATUSES.map((s) => (
              <option key={s} value={s} className="bg-bg-2">
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTrack('all')}
            aria-pressed={track === 'all'}
            className={cn(
              'rounded-pill border px-3.5 py-1.5 font-head text-[11px] font-bold uppercase tracking-[0.1em] transition-colors',
              track === 'all'
                ? 'border-gold bg-gold/15 text-gold'
                : 'border-white/12 text-white/45 hover:border-gold/40 hover:text-white'
            )}
          >
            All Tracks
          </button>

          {TRACKS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTrack(t.name)}
              aria-pressed={track === t.name}
              className={cn(
                'rounded-pill border px-3.5 py-1.5 font-head text-[11px] font-bold uppercase tracking-[0.1em] transition-colors',
                track === t.name
                  ? 'border-gold bg-gold/15 text-gold'
                  : 'border-white/12 text-white/45 hover:border-gold/40 hover:text-white'
              )}
            >
              {TRACK_SHORT_LABEL[t.name] ?? t.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <AdminLoading label="Loading applications…" />
      ) : error ? (
        <AdminError message={error} onRetry={load} />
      ) : filtered.length === 0 ? (
        <AdminEmpty
          title="No applicants match"
          hint="Try a different track, status or search term."
        />
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>Applicant</Th>
              <Th>WhatsApp</Th>
              <Th>Location</Th>
              <Th>Track</Th>
              <Th>Availability</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((app) => (
              <tr key={app.id} className="transition-colors hover:bg-white/[0.02]">
                <Td>
                  <span className="font-semibold text-white">{app.fullName}</span>
                  <a
                    href={`mailto:${app.email}`}
                    className="block text-xs text-gold hover:underline"
                  >
                    {app.email}
                  </a>
                </Td>
                <Td>
                  <PhoneCell app={app} />
                </Td>
                <Td>
                  <span className="text-xs text-white/60">{app.location}</span>
                </Td>
                <Td>
                  <span className="whitespace-nowrap text-xs">
                    {TRACK_SHORT_LABEL[app.track] ?? app.track}
                  </span>
                </Td>
                <Td>
                  <span className="block text-xs text-white/60">
                    {app.preferredSchedule}
                  </span>
                  <span className="block text-[11px] text-white/35">
                    {app.exactSyncHour}
                  </span>
                </Td>
                <Td>
                  <StatusBadge status={app.status} />
                </Td>
                <Td>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setViewing(app)}
                      className={cn(btnGhost, 'px-3 py-1.5')}
                    >
                      Answer
                    </button>

                    <a
                      href={waLink(app.whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Message ${app.fullName} on WhatsApp`}
                      className="rounded-lg p-2 text-white/35 transition-colors hover:bg-status-live/10 hover:text-status-live"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </a>

                    <select
                      value={app.status}
                      onChange={(e) =>
                        changeStatus(app, e.target.value as ApplicationStatus)
                      }
                      aria-label={`Change status for ${app.fullName}`}
                      className="rounded-lg border border-white/12 bg-white/[0.04] px-2 py-1.5 text-xs text-white outline-none focus:border-gold"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s} className="bg-bg-2">
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}

      {/* ── Screening answer ─────────────────────────────── */}
      {viewing && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 py-8">
          <div
            role="presentation"
            onClick={() => setViewing(null)}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="answer-title"
            className="relative max-h-full w-full max-w-lg overflow-y-auto rounded-card border border-gold/20 bg-bg-2 p-6"
          >
            <button
              type="button"
              onClick={() => setViewing(null)}
              aria-label="Close"
              className="absolute right-4 top-4 text-white/40 transition-colors hover:text-white"
              style={{ minHeight: 'auto' }}
            >
              <X className="h-5 w-5" />
            </button>

            <p className="font-head text-[10px] font-bold uppercase tracking-[0.14em] text-gold">
              {viewing.track}
            </p>
            <h2 id="answer-title" className="mt-2 font-head text-h3 font-bold text-white">
              {viewing.fullName}
            </h2>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.1em] text-white/35">
              Screening question
            </p>
            <p className="mt-2 text-sm text-fg-60">
              {TRACKS.find((t) => t.name === viewing.track)?.question ??
                'Question not found for this track.'}
            </p>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.1em] text-white/35">
              Their answer
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-fg-80">
              {viewing.screeningAnswer || '— no answer given —'}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
