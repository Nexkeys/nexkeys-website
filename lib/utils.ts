import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalise a Nigerian phone number to a wa.me deep link.
 * Ported from legacy admin.js:793 — 0803… → 234803…
 */
export function whatsAppLink(phone: string | undefined | null): string {
  let cleaned = (phone ?? '').replace(/\D/g, '');
  if (cleaned.startsWith('0')) cleaned = `234${cleaned.slice(1)}`;
  return `https://wa.me/${cleaned}`;
}

/** YYYY-MM-DD in LOCAL time — prevents the UTC midnight shift. */
export function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** "09:00" → "9:00 AM" */
export function formatTime12(time24: string): string {
  const [hRaw, m] = time24.split(':');
  const h = parseInt(hRaw, 10);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${period}`;
}

/** URL-safe slug from a title. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Average reading speed 200wpm, minimum 1 minute. */
export function readingTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
