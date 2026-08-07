'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, Loader2, PartyPopper } from 'lucide-react';
import { toast } from 'sonner';

import { TRACKS, PREFERRED_SCHEDULES, SYNC_HOURS } from '@/lib/data/tracks';
import { submitApplication } from '@/lib/internship';
import {
  COUNTRY_BY_CODE,
  DEFAULT_COUNTRY,
  flagEmoji,
  fullPhoneNumber,
  guessCountry,
  normaliseSubscriber,
} from '@/lib/data/countries';
import { PhoneInput } from '@/components/forms/phone-input';
import type { Track } from '@/lib/types';
import { cn } from '@/lib/utils';

const STEPS = ['Your Details', 'Track & Screening', 'Commitment'] as const;

interface FormState {
  fullName: string;
  email: string;
  /** Subscriber digits only — the dial code lives in `whatsappCountry`. */
  whatsapp: string;
  /** ISO 3166-1 alpha-2. */
  whatsappCountry: string;
  location: string;
  preferredSchedule: string;
  exactSyncHour: string;
  screeningAnswer: string;
  isCommitted: boolean;
}

const EMPTY: FormState = {
  fullName: '',
  email: '',
  whatsapp: '',
  whatsappCountry: DEFAULT_COUNTRY,
  location: '',
  preferredSchedule: '',
  exactSyncHour: '',
  screeningAnswer: '',
  isCommitted: true,
};

const inputClass =
  'w-full rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3.5 text-[15px] text-white outline-none transition-all duration-300 placeholder:text-fg-40 focus:border-gold focus:bg-white/[0.07] focus:shadow-[0_0_12px_rgba(201,162,39,0.2)]';

const labelClass = 'mb-2 block font-head text-[13px] font-semibold text-white/85';

export function InternshipForm() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [track, setTrack] = useState<Track | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState | 'track', string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  /* Pre-select the applicant's likely country from their timezone/locale, so
     most people never open the dropdown. Runs after mount only — doing it
     during render would desync server and client HTML. */
  useEffect(() => {
    setForm((f) =>
      f.whatsappCountry === DEFAULT_COUNTRY
        ? { ...f, whatsappCountry: guessCountry() }
        : f
    );
  }, []);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validateStep = (index: number): boolean => {
    const next: typeof errors = {};

    if (index === 0) {
      if (!form.fullName.trim()) next.fullName = 'Please enter your full name.';
      if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address.';
      /* Subscriber length varies worldwide (Norway 8, Nigeria 10, China 11),
         so the floor is deliberately permissive — 6 digits rejects obvious
         junk without locking out valid short-format countries. */
      if (normaliseSubscriber(form.whatsapp).length < 6)
        next.whatsapp = 'Enter a reachable WhatsApp number.';
      if (!form.location.trim()) next.location = 'Where are you based?';
      if (!form.preferredSchedule) next.preferredSchedule = 'Choose a daily window.';
      if (!form.exactSyncHour) next.exactSyncHour = 'Choose your sync hour.';
    }

    if (index === 1) {
      if (!track) next.track = `Select 1 of the ${TRACKS.length} tracks.`;
      if (!form.screeningAnswer.trim())
        next.screeningAnswer = 'Answer the screening question to continue.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (!validateStep(0) || !validateStep(1) || !track) {
      toast.error('Please complete every step before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      await submitApplication({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        // Stored as one full international string so the existing admin
        // WhatsApp deep-link keeps working unchanged (plan N2).
        whatsapp: fullPhoneNumber(
          COUNTRY_BY_CODE[form.whatsappCountry]?.dial ?? '',
          form.whatsapp
        ),
        whatsappCountry: form.whatsappCountry,
        whatsappDialCode: COUNTRY_BY_CODE[form.whatsappCountry]?.dial ?? '',
        location: form.location.trim(),
        preferredSchedule: form.preferredSchedule,
        exactSyncHour: form.exactSyncHour,
        // The track NAME is the stored value — legacy contract (plan §17.4).
        track: track.name,
        screeningAnswer: form.screeningAnswer.trim(),
        isCommitted: form.isCommitted,
      });
      setDone(true);
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error ? err.message : 'Could not submit. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const progress = useMemo(() => ((step + 1) / STEPS.length) * 100, [step]);

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center py-16 text-center"
      >
        <span className="mb-6 grid h-20 w-20 place-items-center rounded-full border-2 border-status-success bg-status-success/15 text-status-success">
          <PartyPopper className="h-9 w-9" />
        </span>
        <h3 className="mb-3 font-head text-2xl font-bold">Application received</h3>
        <p className="max-w-md text-body-sm text-fg-60">
          Thank you, {form.fullName.split(' ')[0]}. Your{' '}
          <span className="font-semibold text-gold-light">{track?.name}</span> application is
          in. We review every submission personally and will reach you on WhatsApp if you are
          shortlisted.
        </p>
      </motion.div>
    );
  }

  return (
    <div>
      {/* Step indicator with a gold fill sweep */}
      <div className="mb-9">
        <div className="mb-4 flex items-center justify-between">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2.5">
              <span
                className={cn(
                  'grid h-9 w-9 place-items-center rounded-full border font-head text-sm font-semibold transition-all duration-400',
                  i < step && 'border-status-success bg-status-success/20 text-status-success',
                  i === step && 'border-gold bg-gold text-bg shadow-gold',
                  i > step && 'border-white/15 bg-white/[0.05] text-fg-40'
                )}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span
                className={cn(
                  'hidden font-head text-[13px] font-semibold transition-colors sm:block',
                  i === step ? 'text-white' : 'text-fg-40'
                )}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        <div className="h-1 overflow-hidden rounded-full bg-white/[0.08]">
          <motion.div
            className="h-full rounded-full bg-gradient-gold"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ── STEP 1 ─────────────────────────────────────── */}
        {step === 0 && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <h3 className="mb-1.5 font-head text-2xl font-bold">Tell us about you</h3>
            <p className="mb-7 text-body-sm text-fg-60">
              We use this to reach you if you are shortlisted.
            </p>

            <div className="mb-5">
              <label className={labelClass} htmlFor="fullName">
                Full Name *
              </label>
              <input
                id="fullName"
                className={inputClass}
                placeholder="e.g. Kelechi Okafor"
                value={form.fullName}
                onChange={(e) => set('fullName', e.target.value)}
                aria-invalid={!!errors.fullName}
              />
              {errors.fullName && <p className="mt-1.5 text-xs text-destructive">{errors.fullName}</p>}
            </div>

            <div className="mb-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="email">
                  Email Address *
                </label>
                <input
                  id="email"
                  type="email"
                  className={inputClass}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  aria-invalid={!!errors.email}
                />
                {errors.email && <p className="mt-1.5 text-xs text-destructive">{errors.email}</p>}
              </div>

              <div>
                <label className={labelClass} htmlFor="whatsapp">
                  WhatsApp Number *
                </label>
                <PhoneInput
                  id="whatsapp"
                  country={form.whatsappCountry}
                  onCountryChange={(code) => set('whatsappCountry', code)}
                  value={form.whatsapp}
                  onValueChange={(v) => set('whatsapp', v)}
                  invalid={!!errors.whatsapp}
                />
                {errors.whatsapp ? (
                  <p className="mt-1.5 text-xs text-destructive">{errors.whatsapp}</p>
                ) : (
                  <p className="mt-1.5 text-xs text-white/35">
                    Pick your country — we use this to reach you on WhatsApp.
                  </p>
                )}
              </div>
            </div>

            <div className="mb-5">
              <label className={labelClass} htmlFor="location">
                Location *
              </label>
              <input
                id="location"
                className={inputClass}
                placeholder="e.g. Lagos, Nigeria"
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                aria-invalid={!!errors.location}
              />
              {errors.location && <p className="mt-1.5 text-xs text-destructive">{errors.location}</p>}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="preferredSchedule">
                  Preferred Daily Schedule *
                </label>
                <select
                  id="preferredSchedule"
                  className={inputClass}
                  value={form.preferredSchedule}
                  onChange={(e) => set('preferredSchedule', e.target.value)}
                  aria-invalid={!!errors.preferredSchedule}
                >
                  <option value="">Select Time Window</option>
                  {PREFERRED_SCHEDULES.map((s) => (
                    <option key={s} value={s} className="bg-bg-3">
                      {s}
                    </option>
                  ))}
                </select>
                {errors.preferredSchedule && (
                  <p className="mt-1.5 text-xs text-destructive">{errors.preferredSchedule}</p>
                )}
              </div>

              <div>
                <label className={labelClass} htmlFor="exactSyncHour">
                  Exact Preferred Sync Hour *
                </label>
                <select
                  id="exactSyncHour"
                  className={inputClass}
                  value={form.exactSyncHour}
                  onChange={(e) => set('exactSyncHour', e.target.value)}
                  aria-invalid={!!errors.exactSyncHour}
                >
                  <option value="">Select Hour</option>
                  {SYNC_HOURS.map((h) => (
                    <option key={h} value={h} className="bg-bg-3">
                      {h}
                    </option>
                  ))}
                </select>
                {errors.exactSyncHour && (
                  <p className="mt-1.5 text-xs text-destructive">{errors.exactSyncHour}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── STEP 2 ─────────────────────────────────────── */}
        {step === 1 && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <h3 className="mb-1.5 font-head text-2xl font-bold">Select your track</h3>
            <p className="mb-7 text-body-sm text-fg-60">
              Choose 1 of {TRACKS.length} tracks to reveal its screening question.
            </p>

            <div
              role="radiogroup"
              aria-label="Internship track"
              className="mb-6 grid gap-3 sm:grid-cols-2"
            >
              {TRACKS.map((t) => {
                const selected = track?.id === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => {
                      setTrack(t);
                      setErrors((e) => ({ ...e, track: undefined }));
                    }}
                    className={cn(
                      'group relative flex items-center gap-3 overflow-hidden rounded-xl border p-4 text-left transition-all duration-300',
                      selected
                        ? 'border-gold bg-gold/[0.12] shadow-[0_0_12px_rgba(201,162,39,0.25)]'
                        : 'border-white/[0.08] bg-white/[0.03] hover:-translate-y-0.5 hover:border-gold/30 hover:bg-white/[0.07]'
                    )}
                  >
                    {t.image && (
                      <Image
                        src={t.image}
                        alt=""
                        fill
                        sizes="50vw"
                        className={cn(
                          'object-cover transition-opacity duration-500',
                          selected ? 'opacity-[0.14]' : 'opacity-0 group-hover:opacity-[0.1]'
                        )}
                      />
                    )}

                    <span className="relative text-xl">{t.icon}</span>
                    <span className="relative min-w-0">
                      <span className="block truncate font-head text-sm font-semibold text-white">
                        {t.name}
                      </span>
                      <span className="block truncate text-xs text-fg-40">{t.blurb}</span>
                    </span>

                    {selected && (
                      <motion.span
                        layoutId="track-check"
                        className="relative ml-auto grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold text-bg"
                      >
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </motion.span>
                    )}
                  </button>
                );
              })}
            </div>

            {errors.track && <p className="mb-4 text-xs text-destructive">{errors.track}</p>}

            <AnimatePresence>
              {track && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="rounded-2xl border border-gold/25 bg-gold/[0.05] p-5">
                    <p className="mb-2 font-head text-[11px] font-bold uppercase tracking-[0.08em] text-gold">
                      {track.name} — Screening Question
                    </p>
                    <p className="mb-3.5 text-sm font-semibold leading-relaxed text-white">
                      {track.question}
                    </p>
                    <label className="sr-only" htmlFor="screeningAnswer">
                      Your answer
                    </label>
                    <textarea
                      id="screeningAnswer"
                      rows={5}
                      className={cn(inputClass, 'min-h-[120px] resize-y')}
                      placeholder="Type your thought process and answer clearly here... (Zero links required)"
                      value={form.screeningAnswer}
                      onChange={(e) => set('screeningAnswer', e.target.value)}
                      aria-invalid={!!errors.screeningAnswer}
                    />
                    {errors.screeningAnswer && (
                      <p className="mt-1.5 text-xs text-destructive">{errors.screeningAnswer}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── STEP 3 ─────────────────────────────────────── */}
        {step === 2 && (
          <motion.div
            key="step-3"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <h3 className="mb-1.5 font-head text-2xl font-bold">Program commitment</h3>
            <p className="mb-7 text-body-sm text-fg-60">
              Confirm your availability before submitting your application.
            </p>

            <div className="mb-7 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="mb-4 text-[15px] font-semibold text-white">
                Are you ready and fully committed to dedicate the required weekly hours to
                complete this program?
              </p>

              {[
                {
                  value: true,
                  strong: 'YES, I am 100% committed',
                  rest: ' to attending sync sessions and executing assigned tasks.',
                },
                {
                  value: false,
                  strong: 'I am interested but unsure',
                  rest: ' about my weekly availability right now.',
                },
              ].map((opt) => (
                <label
                  key={String(opt.value)}
                  className="mb-3 flex cursor-pointer items-start gap-3 last:mb-0"
                >
                  <input
                    type="radio"
                    name="isCommitted"
                    className="mt-0.5 h-[18px] w-[18px] accent-gold"
                    checked={form.isCommitted === opt.value}
                    onChange={() => set('isCommitted', opt.value)}
                  />
                  <span className="text-sm leading-relaxed text-white">
                    <strong>{opt.strong}</strong>
                    {opt.rest}
                  </span>
                </label>
              ))}
            </div>

            {/* Review summary */}
            <dl className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm">
              {[
                ['Name', form.fullName],
                ['Email', form.email],
                [
                  'WhatsApp',
                  `${flagEmoji(form.whatsappCountry)} ${fullPhoneNumber(
                    COUNTRY_BY_CODE[form.whatsappCountry]?.dial ?? '',
                    form.whatsapp
                  )}`,
                ],
                ['Location', form.location],
                ['Track', track?.name ?? '—'],
                ['Schedule', `${form.preferredSchedule} · ${form.exactSyncHour}`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-white/[0.06] py-2 last:border-0">
                  <dt className="shrink-0 text-fg-40">{k}</dt>
                  <dd className="truncate text-right font-medium text-white">{v}</dd>
                </div>
              ))}
            </dl>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 0}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 px-5 py-3 font-head text-sm font-semibold text-white transition-colors duration-300 hover:bg-white/[0.08] disabled:pointer-events-none disabled:opacity-0"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={goNext}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-gold px-7 py-3.5 font-head text-sm font-bold text-bg shadow-gold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-gold-lg"
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-gold px-7 py-3.5 font-head text-sm font-bold text-bg shadow-gold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-gold-lg disabled:opacity-70"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? 'Submitting…' : 'Submit Application'}
          </button>
        )}
      </div>
    </div>
  );
}
