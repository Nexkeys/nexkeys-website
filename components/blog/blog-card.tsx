import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Clock } from 'lucide-react';
import type { BlogPost } from '@/lib/types';
import { formatPostDate } from '@/lib/blog';
import { cn } from '@/lib/utils';

/**
 * Blog card. Every value is rendered as a React child — never interpolated
 * into markup — which is what closes the legacy XSS surface (plan §4.5).
 */
export function BlogCard({
  post,
  featured = false,
  priority = false,
}: {
  post: BlogPost;
  featured?: boolean;
  priority?: boolean;
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-card border border-gold/12 bg-bg-2',
        'transition-[border-color,box-shadow,transform] duration-500 ease-luxe',
        'hover:-translate-y-1 hover:border-gold/40 hover:shadow-lift',
        featured && 'md:flex-row'
      )}
    >
      <div
        className={cn(
          'relative overflow-hidden',
          featured ? 'aspect-[16/10] md:aspect-auto md:w-1/2' : 'aspect-[16/10]'
        )}
      >
        <Image
          src={post.imageUrl}
          alt=""
          fill
          /* Covers are arbitrary admin-authored URLs. Optimising them would
             proxy an unknown, possibly slow host through our server — the same
             failure that thum.io caused on the project cards. */
          unoptimized={post.imageUrl.startsWith('http')}
          priority={priority && !post.imageUrl.startsWith('http')}
          sizes={
            featured
              ? '(max-width: 768px) 100vw, 50vw'
              : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
          }
          className="object-cover opacity-70 transition-all [transition-duration:900ms] ease-luxe group-hover:scale-105 group-hover:opacity-90"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg-2 via-transparent to-transparent"
        />
        <span className="absolute left-4 top-4 rounded-pill border border-gold/30 bg-bg/70 px-3 py-1 font-head text-[10px] font-bold uppercase tracking-[0.14em] text-gold backdrop-blur-sm">
          {post.category}
        </span>
      </div>

      <div
        className={cn(
          'flex flex-1 flex-col p-6',
          featured && 'md:justify-center md:p-9'
        )}
      >
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-head text-[10px] uppercase tracking-[0.14em] text-white/35">
          {post.createdAt && <time dateTime={post.createdAt.toISOString()}>{formatPostDate(post.createdAt)}</time>}
          {post.createdAt && <span aria-hidden="true">·</span>}
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            {post.readingTime} min read
          </span>
        </div>

        <h3
          className={cn(
            'font-head font-bold leading-snug text-white transition-colors duration-400 group-hover:text-gold-light',
            featured ? 'text-h3' : 'text-base'
          )}
        >
          {post.title}
        </h3>

        {post.summary && (
          <p
            className={cn(
              'mt-3 text-sm leading-relaxed text-fg-60',
              featured ? 'line-clamp-4' : 'line-clamp-3'
            )}
          >
            {post.summary}
          </p>
        )}

        <span className="mt-5 inline-flex items-center gap-1.5 font-head text-[11px] font-bold uppercase tracking-[0.1em] text-gold transition-all duration-500 group-hover:gap-2.5">
          Read article
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
