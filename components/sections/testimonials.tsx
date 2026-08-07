'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight, Pause, Play, Star } from 'lucide-react';

import { TESTIMONIALS } from '@/lib/data/testimonials';
import { SectionHeader } from '@/components/ui/section-header';
import type { Testimonial } from '@/lib/types';
import { cn } from '@/lib/utils';

/** Renders the quote with its highlighted phrases lifted to white. */
function Quote({ testimonial }: { testimonial: Testimonial }) {
  const { quote, highlights = [] } = testimonial;

  if (highlights.length === 0) return <>{quote}</>;

  const pattern = new RegExp(
    `(${highlights.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
    'g'
  );

  return (
    <>
      {quote.split(pattern).map((part, i) =>
        highlights.includes(part) ? (
          <strong key={i} className="font-semibold text-white">
            {part}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export function Testimonials({
  heading = true,
  className,
}: {
  heading?: boolean;
  className?: string;
}) {
  const [playing, setPlaying] = useState(true);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start', skipSnaps: false },
    [Autoplay({ delay: 5200, stopOnInteraction: false, stopOnMouseEnter: true })]
  );

  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState<number[]>([]);

  useEffect(() => {
    if (!emblaApi) return;
    setSnaps(emblaApi.scrollSnapList());
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on('select', onSelect).on('reInit', onSelect);
  }, [emblaApi]);

  const toggle = useCallback(() => {
    const autoplay = emblaApi?.plugins()?.autoplay;
    if (!autoplay) return;
    if (playing) autoplay.stop();
    else autoplay.play();
    setPlaying((p) => !p);
  }, [emblaApi, playing]);

  return (
    <section
      className={cn('ground-midnight-soft py-section', className)}
      aria-labelledby="testimonials-heading"
    >
      <div className="container">
        {heading && (
          <SectionHeader
            align="center"
            eyebrow="Client Feedback"
            title={
              <span id="testimonials-heading">
                What Clients <span className="text-gradient-gold">Say</span>
              </span>
            }
          />
        )}

        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex touch-pan-y gap-5">
              {TESTIMONIALS.map((t) => (
                <figure
                  key={t.id}
                  className="glass-midnight group flex min-w-0 flex-[0_0_100%] flex-col rounded-card p-7 transition-[border-color,transform] duration-500 hover:-translate-y-1 hover:border-gold/35 sm:flex-[0_0_calc(50%-10px)] lg:flex-[0_0_calc(33.333%-14px)]"
                >
                  <div className="mb-4 flex gap-0.5" aria-label={`${t.stars} out of 5 stars`}>
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />
                    ))}
                  </div>

                  <blockquote className="flex-1 text-body-sm leading-[1.75] text-fg-60">
                    <Quote testimonial={t} />
                  </blockquote>

                  <figcaption className="mt-6 flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-gold font-head text-[13px] font-bold text-bg"
                    >
                      {t.initial}
                    </span>
                    <span>
                      <span className="block font-head text-sm font-bold text-white">
                        {t.name}
                      </span>
                      <span className="block text-xs text-fg-40">{t.role}</span>
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>

          {/* Controls */}
          {/* `flex-wrap`: three 44px controls plus the dot row exceed an
              ultra-narrow viewport on one line. Wrapping keeps every control
              at its accessible size instead of shrinking them. */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => emblaApi?.scrollPrev()}
              aria-label="Previous testimonial"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold/18 bg-white/[0.03] text-fg-60 transition-colors hover:border-gold/45 hover:text-gold-light"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Pagination dots are supplementary — prev/next buttons and swipe
                both remain. Ten 6px dots plus gaps cannot fit below 400px, and
                as targets they are far under 44px, so they are hidden there
                rather than shrunk further. */}
            <div
              className="hidden items-center gap-1.5 xs:flex"
              role="tablist"
              aria-label="Choose slide"
            >
              {snaps.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === selected}
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => emblaApi?.scrollTo(i)}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-400',
                    i === selected ? 'w-7 bg-gold' : 'w-1.5 bg-white/20 hover:bg-white/40'
                  )}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => emblaApi?.scrollNext()}
              aria-label="Next testimonial"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold/18 bg-white/[0.03] text-fg-60 transition-colors hover:border-gold/45 hover:text-gold-light"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Accessibility pause control — preserved from the legacy carousel */}
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? 'Pause testimonials' : 'Play testimonials'}
              className="ml-2 grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold/18 bg-white/[0.03] text-fg-60 transition-colors hover:border-gold/45 hover:text-gold-light"
            >
              {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
