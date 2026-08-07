import type { Metadata } from 'next';

import { listPosts } from '@/lib/blog';
import { SITE } from '@/lib/data/team';
import { BlogIndex } from '@/components/blog/blog-index';
import { Reveal } from '@/components/motion/reveal';
import { CTA } from '@/components/sections/cta';

/**
 * Posts are fetched on the SERVER and revalidated every 5 minutes.
 *
 * This is the change that makes the blog real (plan §4.13). The legacy version
 * fetched from the browser and rendered into `innerHTML`, so a crawler received
 * an empty grid — all of the meta and JSON-LD work in blog.js:479–585 was
 * invisible. Here the article content ships inside the HTML.
 */
export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Notes on software, design and building digital products — from the NexKeys Agency team.',
  alternates: { canonical: `${SITE.url}/blog` },
  openGraph: {
    title: 'Blog · NexKeys Agency',
    description:
      'Notes on software, design and building digital products from the NexKeys Agency team.',
    url: `${SITE.url}/blog`,
    type: 'website',
  },
};

export default async function BlogPage() {
  const posts = await listPosts();

  return (
    <>
      <section className="relative overflow-hidden ground-midnight pb-section-sm pt-[calc(var(--nav-h)+clamp(56px,10vw,120px))]">
        <div
          aria-hidden="true"
          className="grid-overlay pointer-events-none absolute inset-0 -z-10"
        />

        <div className="container">
          <Reveal>
            <p className="eyebrow">Field Notes</p>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="mt-5 max-w-4xl font-display text-display-lg">
              What we&apos;ve<br />
              <span className="text-gradient-gold">learned building.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mt-6 max-w-xl text-body-lg text-fg-60">
              Practical writing on software, design and running digital
              products — no filler, no listicles.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="ground-midnight-soft py-section">
        <div className="container">
          {posts.length === 0 ? (
            <div className="mx-auto max-w-md py-16 text-center">
              <p className="font-head text-h3 font-bold text-white">
                Nothing published yet
              </p>
              <p className="mt-3 text-fg-60">
                The first articles are on their way. Check back shortly.
              </p>
            </div>
          ) : (
            <BlogIndex posts={posts} />
          )}
        </div>
      </section>

      <CTA />
    </>
  );
}
