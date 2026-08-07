'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { joinWaitlist } from '@/lib/internship';

export function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [joined, setJoined] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error('Enter a valid email address.');
      return;
    }

    setBusy(true);
    try {
      await joinWaitlist(email.trim());
      setJoined(true);
      setEmail('');
      toast.success("You're on the early-access waitlist.");
    } catch (err) {
      console.error(err);
      toast.error('Could not add you right now. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto max-w-lg py-12 text-center"
    >
      <span className="mx-auto mb-6 grid h-[72px] w-[72px] place-items-center rounded-full border border-gold/30 bg-gold/10 text-gold shadow-[0_0_30px_rgba(201,162,39,0.2)]">
        <Clock className="h-8 w-8" />
      </span>

      <h3 className="mb-3 font-head text-3xl font-bold">Applications are closed</h3>
      <p className="mb-8 text-body-sm leading-relaxed text-fg-60">
        Our current internship cohort is full. Drop your email and you&apos;ll be the first to
        know the moment the next intake opens across all 10 tracks.
      </p>

      {joined ? (
        <p className="font-head text-sm font-semibold text-status-success">
          ✓ You&apos;ve been added to the early-access waitlist.
        </p>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="waitlist-email">
            Email address
          </label>
          <input
            id="waitlist-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email for the waitlist…"
            className="w-full rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3.5 text-[15px] text-white outline-none transition-all duration-300 placeholder:text-fg-40 focus:border-gold focus:bg-white/[0.07]"
          />
          <button
            type="submit"
            disabled={busy}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-gold px-7 py-3.5 font-head text-sm font-bold text-bg shadow-gold transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-70"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Notify Me
          </button>
        </form>
      )}
    </motion.div>
  );
}
