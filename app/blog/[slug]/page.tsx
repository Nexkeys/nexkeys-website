import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock } from 'lucide-react';

import { formatPostDate, getPostBySlug, listPosts, relatedPosts, toParagraphs } from '@/lib/blog';
import { SITE } from '@/lib/data/team';
import { BlogCard } from '@/components/blog/blog-card';
import { ShareRow } from '@/components/blog/share-row';
import { Reveal } from '@/components/motion/reveal';
import { CTA } from '@/components/sections/cta';

export const revalidate = 300;

/**
 * Real, indexable article URLs — plan §4.13 / O1.
 *
 * The legacy blog rendered every post into a modal on the single `/blog` URL.
 * blog.js:479–585 rewrote `document.title`, the meta description, the Open
 * Graph tags and injected JSON-LD each time a modal opened — none of which a
 * crawler ever saw, because it all happened client-side on one URL. That work
 * finally pays off here.
 */
export async function generateStaticParams() {
  const posts = await listPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: 'Article not found', robots: { index: false, follow: true } };
  }

  const url = `${SITE.url}/blog/${post.slug}`;
  const description = post.summary || post.content.slice(0, 155);

  return {
    title: post.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: post.title,
      description,
      url,
      publishedTime: post.createdAt?.toISOString(),
      images: [{ url: post.imageUrl, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: [post.imageUrl],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  const all = await listPosts();
  const related = relatedPosts(all, post);
  const paragraphs = toParagraphs(post.content);
  const url = `${SITE.url}/blog/${post.slug}`;

  /* Article structured data — now genuinely crawlable (plan O19). */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary,
    image: post.imageUrl.startsWith('http') ? post.imageUrl : `${SITE.url}${post.imageUrl}`,
    datePublished: post.createdAt?.toISOString(),
    dateModified: post.createdAt?.toISOString(),
    author: { '@type': 'Organization', name: SITE.legalName, url: SITE.url },
    publisher: {
      '@type': 'Organization',
      name: SITE.legalName,
      logo: { '@type': 'ImageObject', url: `${SITE.url}/images/brand/logo.jpg` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };

  return (
    <>
      {/* JSON-LD is a data payload, not markup — this is the one safe and
          conventional use of dangerouslySetInnerHTML, and the value is built
          from typed fields, never from raw user input. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article>
        {/* ══ Header ═════════════════════════════════════════ */}
        <header className="relative overflow-hidden ground-midnight pb-section-sm pt-[calc(var(--nav-h)+clamp(40px,8vw,88px))]">
          <div
            aria-hidden="true"
            className="grid-overlay pointer-events-none absolute inset-0 -z-10"
          />

          <div className="container">
            <Link
              href="/blog"
              className="group inline-flex items-center gap-2 font-head text-[11px] font-bold uppercase tracking-[0.14em] text-white/40 transition-colors hover:text-gold"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
              All articles
            </Link>

            <div className="mt-8 max-w-3xl">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-head text-[10px] uppercase tracking-[0.14em] text-white/35">
                <span className="rounded-pill border border-gold/30 px-3 py-1 text-gold">
                  {post.category}
                </span>
                {post.createdAt && (
                  <time dateTime={post.createdAt.toISOString()}>
                    {formatPostDate(post.createdAt)}
                  </time>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  {post.readingTime} min read
                </span>
              </div>

              <h1 className="mt-6 font-head text-h1 font-extrabold leading-tight">
                {post.title}
              </h1>

              {post.summary && (
                <p className="mt-6 text-body-lg text-fg-60">{post.summary}</p>
              )}
            </div>
          </div>
        </header>

        {/* ══ Cover ══════════════════════════════════════════ */}
        <div className="container">
          <div className="relative -mt-4 aspect-[16/9] overflow-hidden rounded-card border border-gold/12">
            <Image
              src={post.imageUrl}
              alt=""
              fill
              unoptimized={post.imageUrl.startsWith('http')}
              priority={!post.imageUrl.startsWith('http')}
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover"
            />
          </div>
        </div>

        {/* ══ Body ═══════════════════════════════════════════ */}
        <div className="ground-midnight-soft py-section">
          <div className="container">
            <div className="measure mx-auto">
              {paragraphs.length > 0 ? (
                paragraphs.map((para, i) => (
                  // Rendered as a React child — escaped by construction. The
                  // legacy renderer concatenated this into innerHTML (§4.5).
                  <p key={i} className="mb-6 text-body-lg leading-relaxed text-fg-80">
                    {para}
                  </p>
                ))
              ) : (
                <p className="text-body-lg text-fg-40">
                  This article has no content yet.
                </p>
              )}

              <div className="divider-gold my-12" />

              <ShareRow title={post.title} url={url} />
            </div>
          </div>
        </div>

        {/* ══ Related ════════════════════════════════════════ */}
        {related.length > 0 && (
          <section
            aria-labelledby="related-heading"
            className="ground-midnight-soft pb-section"
          >
            <div className="container">
              <Reveal>
                <h2
                  id="related-heading"
                  className="mb-10 font-head text-h2 font-bold"
                >
                  Keep <span className="text-gradient-gold">reading</span>
                </h2>
              </Reveal>

              <div className="grid grid-cols-1 gap-6 xs:grid-cols-2 lg:grid-cols-3">
                {related.map((p) => (
                  <BlogCard key={p.id} post={p} />
                ))}
              </div>
            </div>
          </section>
        )}
      </article>

      <CTA />
    </>
  );
}
