'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import {
  COUNTRY_BY_CODE,
  ORDERED_COUNTRIES,
  flagEmoji,
  type Country,
} from '@/lib/data/countries';
import { cn } from '@/lib/utils';

/**
 * International phone field — country combobox + subscriber number.
 *
 * The internship is open globally now, so a hardcoded +234 no longer works.
 * The applicant picks a country; the dial code follows.
 *
 * Accessibility: this is a real combobox — `aria-expanded`, `aria-controls`,
 * `aria-activedescendant`, arrow/Home/End/Escape handling and focus return to
 * the trigger on close. A `<select>` would have been simpler but cannot show
 * flags and a search field, and 200 options without search is unusable.
 */
export function PhoneInput({
  country,
  onCountryChange,
  value,
  onValueChange,
  id = 'phone',
  invalid = false,
  placeholder = '801 234 5678',
}: {
  country: string;
  onCountryChange: (code: string) => void;
  value: string;
  onValueChange: (value: string) => void;
  id?: string;
  invalid?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState('');
  const [highlight, setHighlight] = useState(0);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const selected: Country = COUNTRY_BY_CODE[country] ?? ORDERED_COUNTRIES[0];

  const results = useMemo(() => {
    const q = term.trim().toLowerCase();
    if (!q) return ORDERED_COUNTRIES;
    return ORDERED_COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase() === q ||
        c.dial.startsWith(q.replace(/^\+/, ''))
    );
  }, [term]);

  /* Focus the search box when the list opens. */
  useEffect(() => {
    if (open) {
      setTerm('');
      setHighlight(0);
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open]);

  /* Close on outside click / Escape. */
  useEffect(() => {
    if (!open) return;

    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  /* Keep the highlighted row in view. */
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.children[highlight] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [highlight, open]);

  const choose = (code: string) => {
    onCountryChange(code);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const onSearchKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setHighlight(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setHighlight(results.length - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const pick = results[highlight];
      if (pick) choose(pick.code);
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      <div
        className={cn(
          'flex items-stretch overflow-hidden rounded-xl border bg-white/[0.04] transition-all duration-300',
          invalid ? 'border-destructive' : 'border-white/12 focus-within:border-gold'
        )}
      >
        {/* ── Country trigger ───────────────────────────── */}
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={`Country code: ${selected.name} +${selected.dial}. Change country`}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={`${id}-country-list`}
          className="flex shrink-0 items-center gap-1.5 border-r border-white/10 px-3 text-white transition-colors duration-300 hover:bg-white/[0.05]"
        >
          <span aria-hidden="true" className="text-lg leading-none">
            {flagEmoji(selected.code)}
          </span>
          <span className="font-head text-sm font-semibold">+{selected.dial}</span>
          <ChevronDown
            aria-hidden="true"
            className={cn(
              'h-3.5 w-3.5 text-white/40 transition-transform duration-300',
              open && 'rotate-180'
            )}
          />
        </button>

        {/* ── Subscriber number ─────────────────────────── */}
        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          aria-invalid={invalid}
          placeholder={placeholder}
          className="w-full bg-transparent px-4 py-3.5 text-[15px] text-white outline-none placeholder:text-fg-40"
        />
      </div>

      {/* ── Country list ────────────────────────────────── */}
      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-gold/25 bg-bg-2 shadow-midnight">
          <div className="relative border-b border-white/10">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30"
            />
            <input
              ref={searchRef}
              type="text"
              value={term}
              onChange={(e) => {
                setTerm(e.target.value);
                setHighlight(0);
              }}
              onKeyDown={onSearchKey}
              placeholder="Search country or code…"
              aria-label="Search countries"
              aria-controls={`${id}-country-list`}
              aria-activedescendant={
                results[highlight] ? `${id}-c-${results[highlight].code}` : undefined
              }
              className="w-full bg-transparent py-3 pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/30"
            />
          </div>

          <ul
            ref={listRef}
            id={`${id}-country-list`}
            role="listbox"
            aria-label="Countries"
            className="max-h-64 overflow-y-auto py-1"
          >
            {results.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-white/40">
                No country matched.
              </li>
            )}

            {results.map((c, i) => {
              const active = c.code === country;
              return (
                <li
                  key={c.code}
                  id={`${id}-c-${c.code}`}
                  role="option"
                  aria-selected={active}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => choose(c.code)}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                    i === highlight ? 'bg-gold/12 text-white' : 'text-fg-80',
                    active && 'text-gold'
                  )}
                >
                  <span aria-hidden="true" className="text-base leading-none">
                    {flagEmoji(c.code)}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{c.name}</span>
                  <span className="shrink-0 font-head text-xs text-white/40">
                    +{c.dial}
                  </span>
                  {active && <Check aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
