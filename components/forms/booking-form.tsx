'use client';

import { useEffect, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarCheck,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Globe,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  TIME_SLOTS,
  availableSlots,
  buildIcs,
  createBooking,
  getBookedSlots,
  isSelectableDate,
  parseSlotToDate,
} from '@/lib/bookings';
import { SITE } from '@/lib/data/team';
import { cn } from '@/lib/utils';

const STEPS = ['Date', 'Time', 'Details', 'Confirm'] as const;

const inputClass =
  'w-full min-w-0 rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3.5 text-[15px] text-white outline-none transition-all duration-300 placeholder:text-fg-40 focus:border-gold focus:bg-white/[0.07] focus:shadow-[0_0_12px_rgba(201,162,39,0.2)]';

const labelClass = 'mb-2 block font-head text-[13px] font-semibold text-white/85';

interface Details {
  name: string;
  email: string;
  phone: string;
  notes: string;
}

/**
 * Discovery-call booking — stepped rather than one long form (plan §8.5).
 *
 * The legacy calendar was hand-rolled in contact.html:356–480 with div soup:
 * no keyboard navigation, no screen-reader semantics, no focus management.
 * `react-day-picker` provides all of that; only the skin is ours.
 */
export function BookingForm() {
  const [step, setStep] = useState(0);
  const [date, setDate] = useState<Date | undefined>();
  const [slot, setSlot] = useState<string | null>(null);
  const [booked, setBooked] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [details, setDetails] = useState<Details>({ name: '', email: '', phone: '', notes: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof Details, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  /* The visitor's own zone, shown explicitly so a booking is never ambiguous
     (plan §8.5 — legacy captured it but never displayed it). */
  const [timezone, setTimezone] = useState('');
  useEffect(() => {
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC');
  }, []);

  /* Load availability whenever the chosen day changes. */
  useEffect(() => {
    if (!date) return;
    let cancelled = false;

    setLoadingSlots(true);
    setSlot(null);

    getBookedSlots(date)
      .then((taken) => {
        if (!cancelled) setBooked(taken);
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });

    return () => {
      cancelled = true;
    };
  }, [date]);

  const open = availableSlots(booked);

  const validateDetails = (): boolean => {
    const next: typeof errors = {};
    if (!details.name.trim()) next.name = 'Please enter your name.';
    if (!/^\S+@\S+\.\S+$/.test(details.email)) next.email = 'Enter a valid email address.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const next = () => {
    if (step === 0 && !date) return toast.error('Pick a date to continue.');
    if (step === 1 && !slot) return toast.error('Pick a time to continue.');
    if (step === 2 && !validateDetails()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    if (!date || !slot) return;
    setSubmitting(true);
    try {
      await createBooking({
        name: details.name.trim(),
        email: details.email.trim(),
        phone: details.phone.trim(),
        notes: details.notes.trim(),
        date: parseSlotToDate(date, slot),
        time: slot,
        timezone,
      });
      setDone(true);
      toast.success('Your call is booked.');
    } catch (err) {
      console.error('[booking] submit failed:', err);
      toast.error('Could not complete the booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const downloadIcs = () => {
    if (!date || !slot) return;
    const ics = buildIcs({
      date,
      time: slot,
      name: details.name || 'You',
      organiserEmail: SITE.email,
    });
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nexkeys-discovery-call.ics';
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ── Success ─────────────────────────────────────────── */
  if (done) {
    return (
      <div className="glass-midnight rounded-card p-8 text-center sm:p-12">
        <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full border border-gold/30 bg-gold/10">
          <CalendarCheck className="h-7 w-7 text-gold" aria-hidden="true" />
        </span>

        <h3 className="mt-6 font-head text-h3 font-bold text-white">You&apos;re booked</h3>

        <p className="mx-auto mt-3 max-w-sm text-fg-60">
          A confirmation is on its way to{' '}
          <span className="text-white">{details.email}</span>. We&apos;ll speak on{' '}
          <span className="text-gold">
            {date?.toLocaleDateString('en-GB', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </span>{' '}
          at <span className="text-gold">{slot}</span>.
        </p>

        {timezone && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-white/40">
            <Globe className="h-3 w-3" aria-hidden="true" />
            Times shown in {timezone}
          </p>
        )}

        <button
          type="button"
          onClick={downloadIcs}
          className="sheen mt-8 inline-flex items-center gap-2 rounded-pill bg-gradient-gold px-6 py-3 font-head text-sm font-bold text-bg transition-transform duration-500 ease-luxe hover:-translate-y-0.5"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Add to calendar
        </button>
      </div>
    );
  }

  return (
    <div className="glass-midnight rounded-card p-6 sm:p-9">
      {/* ── Step indicator ────────────────────────────────── */}
      {/* `scroll-x`: four 28px markers plus connectors have an irreducible
          minimum width that exceeds an ultra-narrow viewport. Scrolling the
          indicator itself is preferable to widening the whole page. */}
      <ol
        className="scroll-x mb-8 flex items-center gap-2"
        aria-label="Booking progress"
      >
        {STEPS.map((label, i) => {
          const state = i < step ? 'done' : i === step ? 'current' : 'upcoming';
          return (
            <li key={label} className="flex flex-1 items-center gap-2">
              <span
                aria-current={state === 'current' ? 'step' : undefined}
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-head text-[11px] font-bold transition-colors duration-500',
                  state === 'done' && 'bg-gradient-gold text-bg',
                  state === 'current' && 'border border-gold bg-gold/15 text-gold',
                  state === 'upcoming' && 'border border-white/15 text-white/35'
                )}
              >
                {state === 'done' ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span
                className={cn(
                  'hidden font-head text-[11px] font-bold uppercase tracking-[0.1em] transition-colors sm:inline',
                  state === 'upcoming' ? 'text-white/30' : 'text-white/70'
                )}
              >
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    'h-px flex-1 transition-colors duration-500',
                    i < step ? 'bg-gold/60' : 'bg-white/10'
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* ── 0 · Date ────────────────────────────────── */}
          {step === 0 && (
            <div>
              <h3 className="font-head text-h3 font-bold text-white">Pick a day</h3>
              <p className="mt-2 text-sm text-fg-60">
                Weekdays only. Calls run 30 minutes.
              </p>

              {/* A 7-column month grid has an irreducible minimum width.
                  Below ~320px it cannot fit, so the calendar scrolls inside
                  its own box rather than widening the page. */}
              <div className="scroll-x mt-6 flex justify-center">
                <DayPicker
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(d) => !isSelectableDate(d)}
                  weekStartsOn={1}
                  showOutsideDays={false}
                  classNames={{
                    months: 'w-full',
                    month: 'w-full',
                    caption: 'flex items-center justify-between mb-4',
                    caption_label:
                      'font-head text-sm font-bold uppercase tracking-[0.1em] text-white',
                    nav: 'flex items-center gap-1',
                    nav_button:
                      'inline-flex h-8 w-8 items-center justify-center rounded-full border border-gold/20 text-fg-60 transition-colors hover:border-gold/50 hover:text-white',
                    table: 'w-full border-collapse',
                    head_row: 'flex w-full',
                    head_cell:
                      'flex-1 font-head text-[10px] uppercase tracking-[0.1em] text-white/30 pb-2',
                    row: 'flex w-full',
                    cell: 'flex-1 p-0.5',
                    day: 'mx-auto flex h-9 w-full max-w-[40px] items-center justify-center rounded-lg text-sm text-fg-80 transition-colors duration-300 hover:bg-gold/15 hover:text-white',
                    day_selected:
                      'bg-gradient-gold !text-bg font-bold hover:!bg-gold hover:!text-bg',
                    day_today: 'border border-gold/40 text-gold',
                    day_disabled:
                      'text-white/15 line-through hover:bg-transparent hover:text-white/15 cursor-not-allowed',
                  }}
                />
              </div>
            </div>
          )}

          {/* ── 1 · Time ────────────────────────────────── */}
          {step === 1 && (
            <div>
              <h3 className="font-head text-h3 font-bold text-white">Pick a time</h3>
              <p className="mt-2 inline-flex flex-wrap items-center gap-1.5 text-sm text-fg-60">
                <CalendarDays className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
                {date?.toLocaleDateString('en-GB', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
                {timezone && (
                  <span className="text-white/40">· {timezone}</span>
                )}
              </p>

              {loadingSlots ? (
                <div className="grid grid-cols-2 gap-2.5 pt-6 xs:grid-cols-3">
                  {TIME_SLOTS.slice(0, 9).map((s) => (
                    <div
                      key={s}
                      className="h-11 animate-pulse rounded-xl border border-white/8 bg-white/[0.03]"
                    />
                  ))}
                </div>
              ) : open.length === 0 ? (
                <p className="py-10 text-center text-fg-40">
                  Every slot on this day is taken. Try another date.
                </p>
              ) : (
                <div
                  role="radiogroup"
                  aria-label="Available times"
                  className="grid grid-cols-2 gap-2.5 pt-6 xs:grid-cols-3"
                >
                  {open.map((s) => (
                    <button
                      key={s}
                      type="button"
                      role="radio"
                      aria-checked={slot === s}
                      onClick={() => setSlot(s)}
                      className={cn(
                        'rounded-xl border px-3 py-3 font-head text-[13px] font-semibold transition-all duration-300',
                        slot === s
                          ? 'border-gold bg-gold/15 text-gold shadow-[0_0_12px_rgba(201,162,39,0.2)]'
                          : 'border-white/12 bg-white/[0.03] text-fg-80 hover:border-gold/40 hover:text-white'
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── 2 · Details ─────────────────────────────── */}
          {step === 2 && (
            <div>
              <h3 className="font-head text-h3 font-bold text-white">Your details</h3>
              <p className="mt-2 text-sm text-fg-60">So we know who we&apos;re meeting.</p>

              <div className="mt-6 space-y-5">
                <div>
                  <label htmlFor="bk-name" className={labelClass}>
                    Full name *
                  </label>
                  <input
                    id="bk-name"
                    value={details.name}
                    onChange={(e) => {
                      setDetails((d) => ({ ...d, name: e.target.value }));
                      setErrors((x) => ({ ...x, name: undefined }));
                    }}
                    aria-invalid={!!errors.name}
                    className={inputClass}
                    placeholder="Ada Obi"
                  />
                  {errors.name && (
                    <p className="mt-1.5 text-xs text-status-danger">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="bk-email" className={labelClass}>
                    Email *
                  </label>
                  <input
                    id="bk-email"
                    type="email"
                    value={details.email}
                    onChange={(e) => {
                      setDetails((d) => ({ ...d, email: e.target.value }));
                      setErrors((x) => ({ ...x, email: undefined }));
                    }}
                    aria-invalid={!!errors.email}
                    className={inputClass}
                    placeholder="you@company.com"
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-status-danger">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="bk-phone" className={labelClass}>
                    Phone / WhatsApp
                  </label>
                  <input
                    id="bk-phone"
                    type="tel"
                    value={details.phone}
                    onChange={(e) => setDetails((d) => ({ ...d, phone: e.target.value }))}
                    className={inputClass}
                    placeholder="+234 …"
                  />
                </div>

                <div>
                  <label htmlFor="bk-notes" className={labelClass}>
                    What would you like to cover?
                  </label>
                  <textarea
                    id="bk-notes"
                    rows={4}
                    value={details.notes}
                    onChange={(e) => setDetails((d) => ({ ...d, notes: e.target.value }))}
                    className={cn(inputClass, 'resize-y')}
                    placeholder="A short line about the project helps us prepare."
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── 3 · Confirm ─────────────────────────────── */}
          {step === 3 && (
            <div>
              <h3 className="font-head text-h3 font-bold text-white">Confirm</h3>
              <p className="mt-2 text-sm text-fg-60">One last look before we lock it in.</p>

              <dl className="mt-6 divide-y divide-white/8 overflow-hidden rounded-xl border border-white/10">
                {[
                  {
                    k: 'When',
                    v: `${date?.toLocaleDateString('en-GB', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })} · ${slot}`,
                  },
                  { k: 'Timezone', v: timezone },
                  { k: 'Name', v: details.name },
                  { k: 'Email', v: details.email },
                  ...(details.phone ? [{ k: 'Phone', v: details.phone }] : []),
                  ...(details.notes ? [{ k: 'Notes', v: details.notes }] : []),
                ].map((row) => (
                  <div
                    key={row.k}
                    className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-4"
                  >
                    <dt className="font-head text-[11px] font-bold uppercase tracking-[0.1em] text-white/35 sm:w-28 sm:shrink-0">
                      {row.k}
                    </dt>
                    <dd className="text-sm text-fg-80">{row.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Navigation ────────────────────────────────────── */}
      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={back}
          disabled={step === 0}
          className="inline-flex items-center gap-1.5 rounded-pill border border-white/12 px-5 py-2.5 font-head text-[12px] font-bold uppercase tracking-[0.1em] text-fg-60 transition-colors duration-400 hover:border-gold/40 hover:text-white disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={next}
            className="sheen inline-flex items-center gap-1.5 rounded-pill bg-gradient-gold px-6 py-2.5 font-head text-[12px] font-bold uppercase tracking-[0.1em] text-bg transition-transform duration-500 ease-luxe hover:-translate-y-0.5"
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="sheen inline-flex items-center gap-2 rounded-pill bg-gradient-gold px-6 py-2.5 font-head text-[12px] font-bold uppercase tracking-[0.1em] text-bg transition-transform duration-500 ease-luxe hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Booking…
              </>
            ) : (
              <>
                <CalendarCheck className="h-4 w-4" />
                Confirm booking
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
