'use client';

import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Bot, Layers, Smartphone, Sparkles, TrendingUp, Users } from 'lucide-react';
import { useRef, type ReactNode } from 'react';

import { SERVICES } from '@/lib/data/services';
import { SectionHeader } from '@/components/ui/section-header';
import { RevealGroup, RevealItem } from '@/components/motion/reveal';
import { useCapabilities } from '@/hooks/use-capabilities';
import { cn } from '@/lib/utils';

const ICONS = { Layers, Smartphone, Sparkles, TrendingUp, Bot, Users } as const;

/** Card that tilts in 3D toward the pointer. */
function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { isMobile, reduced } = useCapabilities();

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const spring = { stiffness: 150, damping: 20, mass: 0.4 };
  const rotX = useSpring(useTransform(py, [-0.5, 0.5], [4.5, -4.5]), spring);
  const rotY = useSpring(useTransform(px, [-0.5, 0.5], [-4.5, 4.5]), spring);

  const active = !isMobile && !reduced;

  return (
    <motion.div
      ref={ref}
      onMouseMove={(e) => {
        if (!active) return;
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        px.set((e.clientX - r.left) / r.width - 0.5);
        py.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onMouseLeave={() => {
        px.set(0);
        py.set(0);
      }}
      style={active ? { rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d' } : undefined}
      className={cn('h-full', className)}
    >
      {children}
    </motion.div>
  );
}

export function BentoServices() {
  return (
    <section id="services" className="py-section" aria-labelledby="services-heading">
      <div className="container">
        <SectionHeader
          eyebrow="What We Do"
          title={
            <span id="services-heading">
              Services Built for
              <br />
              <span className="text-gradient-gold">Modern Businesses</span>
            </span>
          }
          description="Every deliverable is crafted with performance, accessibility, and measurable growth in mind."
        />

        <RevealGroup
          className="grid auto-rows-[minmax(200px,auto)] grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
          stagger={0.07}
        >
          {SERVICES.map((service) => {
            const Icon = ICONS[service.icon as keyof typeof ICONS] ?? Layers;
            const isFeature = service.span === 'feature';
            const isWide = service.span === 'wide';

            return (
              <RevealItem
                key={service.id}
                className={cn(
                  isFeature && 'md:col-span-2 md:row-span-2',
                  isWide && 'md:col-span-2'
                )}
              >
                <TiltCard>
                  <article
                    className={cn(
                      'group relative flex h-full flex-col overflow-hidden rounded-card border border-gold/12 bg-white/[0.025] backdrop-blur-sm',
                      'transition-[border-color,box-shadow,transform] duration-500 ease-luxe',
                      'hover:-translate-y-1.5 hover:border-gold/38 hover:shadow-lift'
                    )}
                  >
                    {/* Imagery on the feature tiles */}
                    {service.image && (
                      <div
                        className={cn(
                          'relative w-full overflow-hidden',
                          isFeature ? 'h-56 md:h-72' : 'h-40'
                        )}
                      >
                        <Image
                          src={service.image}
                          alt=""
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                          className="object-cover opacity-70 transition-transform [transition-duration:900ms] ease-luxe group-hover:scale-[1.06]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-bg-2 via-bg-2/50 to-transparent" />
                        <div className="absolute inset-0 bg-gold/[0.06] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                      </div>
                    )}

                    <div className={cn('relative z-10 flex flex-1 flex-col p-7 md:p-8')}>
                      <span className="mb-5 grid h-12 w-12 place-items-center rounded-xl border border-gold/20 bg-gold/[0.13] text-gold-light transition-all duration-500 group-hover:bg-gold/25 group-hover:shadow-[0_0_24px_rgba(201,162,39,0.28)]">
                        <Icon className="h-5 w-5" strokeWidth={1.75} />
                      </span>

                      <h3
                        className={cn(
                          'mb-3 font-head font-bold',
                          isFeature ? 'text-2xl md:text-3xl' : 'text-lg'
                        )}
                      >
                        {service.title}
                      </h3>

                      <p className="text-body-sm leading-relaxed text-fg-60">
                        {service.description}
                      </p>

                      <div className="mt-auto flex flex-wrap gap-2 pt-6">
                        {service.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-pill border border-gold/20 bg-gold/[0.13] px-3 py-1 font-head text-[10px] font-bold uppercase tracking-[0.1em] text-gold-light"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Corner glow */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-gradient-gold opacity-[0.05] blur-[40px] transition-opacity duration-500 group-hover:opacity-[0.16]"
                    />
                  </article>
                </TiltCard>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
