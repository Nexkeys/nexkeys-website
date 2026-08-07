import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

import { Hero } from '@/components/hero/hero';
import { Marquee } from '@/components/sections/marquee';
import { Stats } from '@/components/sections/stats';
import { BentoServices } from '@/components/sections/bento-services';
import { Process } from '@/components/sections/process';
import { Testimonials } from '@/components/sections/testimonials';
import { CTA } from '@/components/sections/cta';
import { ProjectCard } from '@/components/sections/project-card';
import { SectionHeader } from '@/components/ui/section-header';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/reveal';
import { FEATURED_PROJECTS } from '@/lib/data/projects';
import { SITE } from '@/lib/data/team';

const TOOL_STACK = [
  { name: 'React', src: '/images/tool-stack/react.png' },
  { name: 'Next.js', src: '/images/tool-stack/nextjs.png' },
  { name: 'Node.js', src: '/images/tool-stack/nodejs.png' },
  { name: 'TypeScript', src: '/images/tool-stack/typescript.png' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: SITE.legalName,
  url: SITE.url,
  email: SITE.email,
  telephone: SITE.phone,
  description: SITE.description,
  areaServed: 'Worldwide',
  sameAs: SITE.socials.map((s) => s.href),
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Hero />
      <Marquee />
      <Stats />
      <BentoServices />

      {/* Tool stack — now using local assets instead of the devicon CDN */}
      <section className="pb-section-sm" aria-label="Our tool stack">
        <div className="container text-center">
          <Reveal>
            <p className="font-head text-label font-bold uppercase tracking-[0.2em] text-fg-40">
              Our Tool Stack
            </p>
          </Reveal>

          <RevealGroup className="mt-8 flex flex-wrap items-center justify-center gap-8">
            {TOOL_STACK.map((tool) => (
              <RevealItem key={tool.name}>
                <Image
                  src={tool.src}
                  alt={tool.name}
                  title={tool.name}
                  width={44}
                  height={44}
                  className="h-11 w-11 object-contain opacity-45 transition-opacity duration-500 hover:opacity-90"
                />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <Process />

      {/* Featured work */}
      <section className="py-section" aria-labelledby="work-heading">
        <div className="container">
          <SectionHeader
            eyebrow="Case Studies"
            title={
              <span id="work-heading">
                Work That <span className="text-gradient-gold">Speaks for Itself</span>
              </span>
            }
          />

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURED_PROJECTS.map((project, i) => (
              <ProjectCard key={project.id} project={project} priority={i < 2} />
            ))}
          </div>

          <Reveal delay={0.15} className="mt-14 text-center">
            <Link
              href="/work"
              className="glass group inline-flex items-center gap-2 rounded-pill px-8 py-4 font-head text-sm font-semibold text-white transition-all duration-500 hover:border-gold/45"
            >
              View All Case Studies
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </section>

      <Testimonials />
      <CTA />
    </>
  );
}
