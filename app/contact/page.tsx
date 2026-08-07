import type { Metadata } from 'next';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';

import { SITE } from '@/lib/data/team';
import { BriefForm } from '@/components/forms/brief-form';
import { BookingForm } from '@/components/forms/booking-form';
import { Reveal } from '@/components/motion/reveal';
import { SectionHeader } from '@/components/ui/section-header';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Send a project brief or book a 30-minute discovery call with NexKeys Agency. We reply within 48 hours.',
  alternates: { canonical: `${SITE.url}/contact` },
  openGraph: {
    title: 'Contact · NexKeys Agency',
    description:
      'Send a project brief or book a 30-minute discovery call. We reply within 48 hours.',
    url: `${SITE.url}/contact`,
  },
};

const CHANNELS = [
  {
    icon: Mail,
    label: 'Email',
    value: SITE.email,
    href: `mailto:${SITE.email}`,
  },
  {
    icon: Phone,
    label: 'Phone',
    value: SITE.phone,
    href: SITE.phoneHref,
  },
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: 'Message us directly',
    href: `https://wa.me/${SITE.phoneHref.replace(/\D/g, '')}`,
  },
  {
    icon: MapPin,
    label: 'Based in',
    value: 'Lagos, Nigeria — working globally',
  },
];

export default function ContactPage() {
  return (
    <>
      {/* ══ Header ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden ground-midnight pb-section-sm pt-[calc(var(--nav-h)+clamp(56px,10vw,120px))]">
        <div
          aria-hidden="true"
          className="grid-overlay pointer-events-none absolute inset-0 -z-10"
        />

        <div className="container">
          <Reveal>
            <p className="eyebrow">Get in Touch</p>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="mt-5 max-w-4xl font-display text-display-lg">
              Let&apos;s talk about<br />
              <span className="text-gradient-gold">what you&apos;re building.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mt-6 max-w-xl text-body-lg text-fg-60">
              Send a brief and we&apos;ll reply within 48 hours — or skip the
              back-and-forth and put 30 minutes in the diary.
            </p>
          </Reveal>

          {/* ── Channels ────────────────────────────────── */}
          <Reveal delay={0.24}>
            <ul className="mt-12 grid grid-cols-1 gap-4 xs:grid-cols-2 lg:grid-cols-4">
              {CHANNELS.map((c) => {
                const Icon = c.icon;
                const body = (
                  <>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-card border border-gold/25 bg-gold/[0.07]">
                      <Icon className="h-4 w-4 text-gold" aria-hidden="true" />
                    </span>
                    <span className="mt-4 block font-head text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
                      {c.label}
                    </span>
                    <span className="mt-1 block break-words text-sm text-fg-80">
                      {c.value}
                    </span>
                  </>
                );

                return (
                  <li key={c.label}>
                    {c.href ? (
                      <a
                        href={c.href}
                        target={c.href.startsWith('http') ? '_blank' : undefined}
                        rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        data-tap
                        className="glass block h-full rounded-card p-5 transition-[border-color,transform] duration-500 ease-luxe hover:-translate-y-1 hover:border-gold/40"
                      >
                        {body}
                      </a>
                    ) : (
                      <div className="glass h-full rounded-card p-5">{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ══ Brief ════════════════════════════════════════════ */}
      <section aria-labelledby="brief-heading" className="ground-midnight-soft py-section">
        <div className="container">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
            <div>
              <SectionHeader
                eyebrow="Step One"
                className="mb-8"
                title={
                  <span id="brief-heading">
                    Send a <span className="text-gradient-gold">project brief</span>
                  </span>
                }
                description="The more you tell us, the more useful our first reply will be."
              />

              <ul className="space-y-4">
                {[
                  'We read every brief personally — no bots, no gatekeeping.',
                  'You get a considered reply within 48 hours.',
                  'NDA on request, before you share anything sensitive.',
                ].map((point) => (
                  <li key={point} className="flex gap-3 text-sm text-fg-60">
                    <span
                      aria-hidden="true"
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
                    />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Vertical, not horizontal. A `direction="left"` reveal starts the
                element 28px to the RIGHT and eases back — and this form sits on
                the right edge of the grid, so every page load briefly pushed the
                document ~28px wide. Vertical motion cannot do that. */}
            <Reveal direction="up">
              <BriefForm />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ Booking ══════════════════════════════════════════ */}
      <section aria-labelledby="booking-heading" className="ground-midnight py-section">
        <div className="container">
          <SectionHeader
            eyebrow="Step Two — Optional"
            align="center"
            title={
              <span id="booking-heading">
                Book a <span className="text-gradient-gold">discovery call</span>
              </span>
            }
            description="Thirty minutes, weekdays, no obligation. Pick a slot that suits you."
          />

          <div className="mx-auto max-w-2xl">
            <Reveal>
              <BookingForm />
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
