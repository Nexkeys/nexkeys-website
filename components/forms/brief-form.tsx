'use client';

import { useState } from 'react';
import emailjs from '@emailjs/browser';
import { Check, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/**
 * Project brief → EmailJS.
 *
 * IDs ARE FROZEN (plan N6). The service and both template ids match the legacy
 * contact.html exactly, as does the payload shape — the templates reference
 * these variable names, so renaming a field silently produces a blank email.
 *
 * The public key is public by design: EmailJS browser SDK requires it, and it
 * only permits sending against these templates.
 */
const EMAILJS = {
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ?? 'qVxTvhFGY7jbR2jFh',
  serviceId: 'nexkeys_service',
  ownerTemplate: 'nexkeys_owner_notify',
  clientTemplate: 'nexkeys_client_confirm',
} as const;

const BUDGETS = [
  'Under $1,000',
  '$1,000 – $5,000',
  '$5,000 – $15,000',
  '$15,000+',
  'Not sure yet',
] as const;

const SERVICES = [
  'Web App / Website',
  'Mobile App',
  'UI/UX Design',
  'Landing Page',
  'AI & Automation',
  'Technical Team',
] as const;

interface Brief {
  name: string;
  email: string;
  company: string;
  service: string;
  budget: string;
  message: string;
}

const EMPTY: Brief = {
  name: '',
  email: '',
  company: '',
  service: '',
  budget: '',
  message: '',
};

/* `min-w-0`: a <select> keeps an intrinsic width from its longest option and
   a grid/flex item defaults to `min-width:auto`, so without this the widest
   option ('Brand Copywriting & Content Creation') forced the form ~12px wider
   than the page at 390/768/1024. */
const inputClass =
  'w-full min-w-0 rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3.5 text-[15px] text-white outline-none transition-all duration-300 placeholder:text-fg-40 focus:border-gold focus:bg-white/[0.07] focus:shadow-[0_0_12px_rgba(201,162,39,0.2)]';

const labelClass = 'mb-2 block font-head text-[13px] font-semibold text-white/85';

export function BriefForm() {
  const [form, setForm] = useState<Brief>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Brief, string>>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const set = <K extends keyof Brief>(key: K, value: Brief[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = 'Please enter your name.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address.';
    if (form.message.trim().length < 10)
      next.message = 'A sentence or two about the project, please.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSending(true);

    const payload = {
      from_name: form.name.trim(),
      from_email: form.email.trim(),
      company: form.company.trim() || 'Not provided',
      service: form.service || 'Not specified',
      budget: form.budget || 'Not specified',
      message: form.message.trim(),
      reply_to: form.email.trim(),
    };

    try {
      // Owner notification first — that one must not be lost.
      await emailjs.send(EMAILJS.serviceId, EMAILJS.ownerTemplate, payload, {
        publicKey: EMAILJS.publicKey,
      });

      // Client confirmation is best-effort: if it fails the brief still
      // reached us, so we do not show the visitor an error.
      try {
        await emailjs.send(EMAILJS.serviceId, EMAILJS.clientTemplate, payload, {
          publicKey: EMAILJS.publicKey,
        });
      } catch (err) {
        console.warn('[brief] client confirmation failed:', err);
      }

      setSent(true);
      setForm(EMPTY);
      toast.success('Brief sent — we’ll reply within 48 hours.');
    } catch (err) {
      console.error('[brief] send failed:', err);
      toast.error('Could not send the brief. Email us directly and we’ll pick it up.');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="glass-midnight rounded-card p-8 text-center sm:p-12">
        <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full border border-gold/30 bg-gold/10">
          <Check className="h-7 w-7 text-gold" aria-hidden="true" />
        </span>
        <h3 className="mt-6 font-head text-h3 font-bold text-white">Brief received</h3>
        <p className="mx-auto mt-3 max-w-sm text-fg-60">
          Thank you. We read every brief personally and reply within 48 hours.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-8 inline-flex items-center rounded-pill border border-gold/25 px-6 py-3 font-head text-sm font-bold text-fg-80 transition-colors hover:border-gold/60 hover:text-white"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="glass-midnight rounded-card p-6 sm:p-9">
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="min-w-0">
            <label htmlFor="bf-name" className={labelClass}>
              Your name *
            </label>
            <input
              id="bf-name"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              aria-invalid={!!errors.name}
              className={inputClass}
              placeholder="Ada Obi"
            />
            {errors.name && <p className="mt-1.5 text-xs text-status-danger">{errors.name}</p>}
          </div>

          <div className="min-w-0">
            <label htmlFor="bf-email" className={labelClass}>
              Email *
            </label>
            <input
              id="bf-email"
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              aria-invalid={!!errors.email}
              className={inputClass}
              placeholder="you@company.com"
            />
            {errors.email && <p className="mt-1.5 text-xs text-status-danger">{errors.email}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="bf-company" className={labelClass}>
            Company
          </label>
          <input
            id="bf-company"
            value={form.company}
            onChange={(e) => set('company', e.target.value)}
            className={inputClass}
            placeholder="Optional"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="min-w-0">
            <label htmlFor="bf-service" className={labelClass}>
              What do you need?
            </label>
            <select
              id="bf-service"
              value={form.service}
              onChange={(e) => set('service', e.target.value)}
              className={cn(inputClass, 'appearance-none')}
            >
              <option value="">Select a service</option>
              {SERVICES.map((s) => (
                <option key={s} value={s} className="bg-bg-2">
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-0">
            <label htmlFor="bf-budget" className={labelClass}>
              Budget range
            </label>
            <select
              id="bf-budget"
              value={form.budget}
              onChange={(e) => set('budget', e.target.value)}
              className={cn(inputClass, 'appearance-none')}
            >
              <option value="">Select a range</option>
              {BUDGETS.map((b) => (
                <option key={b} value={b} className="bg-bg-2">
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="bf-message" className={labelClass}>
            Tell us about the project *
          </label>
          <textarea
            id="bf-message"
            rows={5}
            value={form.message}
            onChange={(e) => set('message', e.target.value)}
            aria-invalid={!!errors.message}
            className={cn(inputClass, 'resize-y')}
            placeholder="What are you building, who is it for, and when do you need it?"
          />
          {errors.message && (
            <p className="mt-1.5 text-xs text-status-danger">{errors.message}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={sending}
        className="sheen mt-8 inline-flex w-full items-center justify-center gap-2 rounded-pill bg-gradient-gold px-7 py-3.5 font-head text-sm font-bold text-bg transition-transform duration-500 ease-luxe hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60 sm:w-auto"
      >
        {sending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending…
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Send the brief
          </>
        )}
      </button>

      <p className="mt-4 text-xs text-white/35">
        We reply within 48 hours. NDA on request.
      </p>
    </form>
  );
}
