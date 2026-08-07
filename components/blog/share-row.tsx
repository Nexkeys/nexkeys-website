'use client';

import { useState } from 'react';
import { Check, Link2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Share row. The network links are plain anchors — no SDKs, no third-party
 * script, nothing to load. Only "copy link" needs JS.
 */
export function ShareRow({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const targets = [
    {
      label: 'X',
      href: `https://x.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    },
    {
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy the link');
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="font-head text-[11px] font-bold uppercase tracking-[0.14em] text-white/35">
        Share
      </span>

      {targets.map((t) => (
        <a
          key={t.label}
          href={t.href}
          target="_blank"
          rel="noopener noreferrer"
          data-tap
          className="inline-flex items-center rounded-pill border border-gold/20 px-4 py-2 font-head text-[11px] font-bold uppercase tracking-[0.1em] text-fg-60 transition-colors duration-400 hover:border-gold/50 hover:text-white"
        >
          {t.label}
        </a>
      ))}

      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-2 rounded-pill border border-gold/20 px-4 py-2 font-head text-[11px] font-bold uppercase tracking-[0.1em] text-fg-60 transition-colors duration-400 hover:border-gold/50 hover:text-white"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-status-success" />
        ) : (
          <Link2 className="h-3.5 w-3.5" />
        )}
        {copied ? 'Copied' : 'Copy link'}
      </button>
    </div>
  );
}
