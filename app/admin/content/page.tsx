'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Loader2, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

import { getWorkContent, saveWorkContent } from '@/lib/admin';
import { PROJECTS, WORK_FILTERS } from '@/lib/data/projects';
import type { Project, ProjectCategory, WorkPageContent } from '@/lib/types';
import {
  AdminError,
  AdminHeader,
  AdminLoading,
  ConfirmDialog,
  adminInput,
  adminLabel,
  btnGhost,
  btnPrimary,
  useConfirm,
} from '@/components/admin/ui';
import { cn } from '@/lib/utils';

/** Seed list when the CMS has never stored one. */
const DEFAULT_CATEGORY_IDS = WORK_FILTERS.filter((f) => f.id !== 'all').map(
  (f) => f.id as string
);

/** Category ids are used in URLs and filter state — keep them slug-safe. */
function slugifyCategory(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24);
}

const BLANK: Project = {
  id: '',
  name: '',
  title: '',
  category: '',
  categories: ['web'],
  url: '',
  label: '',
  isLive: false,
  gradient: 'linear-gradient(135deg,#0e0900 0%,#2e1e00 100%)',
};

/**
 * Work-page CMS.
 *
 * PLAN §4.2 IS FIXED STRUCTURALLY, NOT HERE. In the legacy site, saving this
 * screen wrote `pageContent/work`, and `work.js` then rebuilt the filter
 * buttons with innerHTML — destroying the click handlers `main.js` had bound
 * and killing filtering on the public page, silently. The public grid is now a
 * React component with typed state and bound handlers, so there is no DOM for
 * a save to clobber. This screen cannot break the public page.
 */
export default function AdminContentPage() {
  const [header, setHeader] = useState({ headerTitle: '', headerDescription: '' });
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORY_IDS);
  const [newCategory, setNewCategory] = useState('');
  const [usingFallback, setUsingFallback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const confirm = useConfirm<number>();
  const confirmCategory = useConfirm<string>();

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const content = await getWorkContent();
      setHeader({
        headerTitle: content?.headerTitle ?? '',
        headerDescription: content?.headerDescription ?? '',
      });

      setCategories(
        content?.filterCategories?.length
          ? content.filterCategories
          : DEFAULT_CATEGORY_IDS
      );

      if (content?.projects?.length) {
        setProjects(content.projects);
        setUsingFallback(false);
      } else {
        // Nothing in the CMS yet — seed the editor from the built-in catalogue
        // so the first save does not wipe the public page.
        setProjects(PROJECTS);
        setUsingFallback(true);
      }
    } catch (err) {
      console.error('[admin] content load failed:', err);
      setError(err instanceof Error ? err.message : 'Could not load page content.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const update = (index: number, patch: Partial<Project>) =>
    setProjects((ps) => ps.map((p, i) => (i === index ? { ...p, ...patch } : p)));

  const move = (index: number, delta: number) =>
    setProjects((ps) => {
      const next = [...ps];
      const target = index + delta;
      if (target < 0 || target >= next.length) return ps;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const toggleCategory = (index: number, cat: ProjectCategory) =>
    setProjects((ps) =>
      ps.map((p, i) => {
        if (i !== index) return p;
        const has = p.categories.includes(cat);
        // Never allow an empty category list — it would make the card
        // unreachable behind every filter.
        const next = has ? p.categories.filter((c) => c !== cat) : [...p.categories, cat];
        return { ...p, categories: next.length ? next : p.categories };
      })
    );

  /** How many projects currently use a category — shown before you remove it. */
  const categoryUsage = (cat: string) =>
    projects.filter((p) => p.categories.includes(cat as ProjectCategory)).length;

  const addCategory = () => {
    const id = slugifyCategory(newCategory);
    if (!id) return toast.error('Enter a category name.');
    if (categories.includes(id)) return toast.error(`"${id}" already exists.`);
    setCategories((c) => [...c, id]);
    setNewCategory('');
    toast.success(`Added "${id}"`);
  };

  /**
   * Removing a category also strips it from every project that used it —
   * otherwise those projects keep a filter id that no longer has a button,
   * which is precisely the kind of orphaned state that produced the legacy
   * filter bug (plan §4.2).
   */
  const removeCategory = (cat: string) => {
    setCategories((c) => c.filter((x) => x !== cat));
    setProjects((ps) =>
      ps.map((p) => {
        if (!p.categories.includes(cat as ProjectCategory)) return p;
        const next = p.categories.filter((c) => c !== cat);
        // Never leave a project with no category — it would be unreachable
        // behind every filter.
        return { ...p, categories: next.length ? next : p.categories };
      })
    );
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload: WorkPageContent = {
        headerTitle: header.headerTitle,
        headerDescription: header.headerDescription,
        filterCategories: categories,
        projects,
      };
      await saveWorkContent(payload);
      setUsingFallback(false);
      toast.success('Work page saved');
    } catch (err) {
      console.error('[admin] content save failed:', err);
      toast.error('Could not save the page content.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminLoading label="Loading page content…" />;
  if (error) return <AdminError message={error} onRetry={load} />;

  return (
    <>
      <AdminHeader
        title="Page Content"
        description="The /work page — header copy and the project catalogue."
        actions={
          <button type="button" onClick={save} disabled={saving} className={btnPrimary}>
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Save changes
          </button>
        }
      />

      {usingFallback && (
        <p className="mb-6 rounded-card border border-gold/25 bg-gold/[0.06] px-5 py-4 text-sm text-fg-80">
          No CMS content exists yet, so this is pre-filled from the built-in
          catalogue of {PROJECTS.length} projects. Saving will make this the live
          source for /work.
        </p>
      )}

      {/* ── Header copy ──────────────────────────────────── */}
      <section className="mb-8 rounded-card border border-gold/12 bg-bg-2 p-5 sm:p-7">
        <h2 className="mb-5 font-head text-sm font-bold text-white">Header</h2>

        <div className="space-y-5">
          <div>
            <label htmlFor="wc-title" className={adminLabel}>
              Header title
            </label>
            <input
              id="wc-title"
              value={header.headerTitle}
              onChange={(e) => setHeader((h) => ({ ...h, headerTitle: e.target.value }))}
              className={adminInput}
              placeholder="Leave blank to use the default"
            />
          </div>

          <div>
            <label htmlFor="wc-desc" className={adminLabel}>
              Header description
            </label>
            <textarea
              id="wc-desc"
              rows={2}
              value={header.headerDescription}
              onChange={(e) =>
                setHeader((h) => ({ ...h, headerDescription: e.target.value }))
              }
              className={cn(adminInput, 'resize-y')}
              placeholder="Leave blank to use the default"
            />
          </div>
        </div>
      </section>

      {/* ── Filter categories ────────────────────────────── */}
      <section className="mb-8 rounded-card border border-gold/12 bg-bg-2 p-5 sm:p-7">
        <h2 className="mb-2 font-head text-sm font-bold text-white">
          Filter categories
        </h2>
        <p className="mb-5 text-sm text-fg-60">
          These become the filter buttons on /work. Removing one also clears it
          from every project using it.
        </p>

        <ul className="mb-5 flex flex-wrap gap-2">
          {categories.map((cat) => {
            const used = categoryUsage(cat);
            return (
              <li
                key={cat}
                className="inline-flex items-center gap-2 rounded-pill border border-gold/25 bg-gold/[0.06] py-1.5 pl-3.5 pr-1.5"
              >
                <span className="font-head text-[11px] font-bold uppercase tracking-[0.1em] text-gold">
                  {cat}
                </span>
                <span
                  className="rounded-pill bg-black/30 px-2 py-0.5 text-[10px] text-white/45"
                  title={`${used} project${used === 1 ? '' : 's'} use this`}
                >
                  {used}
                </span>
                <button
                  type="button"
                  onClick={() => confirmCategory.ask(cat)}
                  aria-label={`Remove the ${cat} category`}
                  className="grid h-6 w-6 place-items-center rounded-full text-white/40 transition-colors hover:bg-destructive/15 hover:text-destructive"
                  style={{ minHeight: 'auto' }}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}

          {categories.length === 0 && (
            <li className="text-sm text-fg-40">
              No categories — /work will show only “All Projects”.
            </li>
          )}
        </ul>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCategory();
              }
            }}
            placeholder="New category, e.g. healthcare"
            aria-label="New category name"
            className={cn(adminInput, 'sm:max-w-xs')}
          />
          <button type="button" onClick={addCategory} className={btnGhost}>
            <Plus className="h-3.5 w-3.5" />
            Add category
          </button>
        </div>

        {newCategory.trim() && slugifyCategory(newCategory) !== newCategory.trim() && (
          <p className="mt-2 text-xs text-white/35">
            Will be saved as{' '}
            <span className="text-gold">{slugifyCategory(newCategory) || '—'}</span>
          </p>
        )}
      </section>

      {/* ── Projects ─────────────────────────────────────── */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-head text-sm font-bold text-white">
          Projects ({projects.length})
        </h2>
        <button
          type="button"
          onClick={() => setProjects((ps) => [...ps, { ...BLANK, id: `project-${Date.now()}` }])}
          className={btnGhost}
        >
          <Plus className="h-3.5 w-3.5" />
          Add project
        </button>
      </div>

      <ul className="space-y-3">
        {projects.map((project, index) => (
          <li
            key={`${project.id}-${index}`}
            className="rounded-card border border-gold/12 bg-bg-2 p-4 sm:p-5"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">
                  {project.name || 'Untitled project'}
                </p>
                <p className="truncate text-xs text-white/40">{project.url || 'No URL'}</p>
              </div>

              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label="Move up"
                  className="rounded-lg p-2 text-white/35 transition-colors hover:text-white disabled:opacity-20"
                  style={{ minHeight: 'auto' }}
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === projects.length - 1}
                  aria-label="Move down"
                  className="rounded-lg p-2 text-white/35 transition-colors hover:text-white disabled:opacity-20"
                  style={{ minHeight: 'auto' }}
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => confirm.ask(index)}
                  aria-label={`Remove ${project.name}`}
                  className="rounded-lg p-2 text-white/35 transition-colors hover:bg-destructive/10 hover:text-destructive"
                  style={{ minHeight: 'auto' }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={adminLabel}>Name</label>
                <input
                  value={project.name}
                  onChange={(e) => update(index, { name: e.target.value })}
                  className={adminInput}
                />
              </div>
              <div>
                <label className={adminLabel}>Card title</label>
                <input
                  value={project.title}
                  onChange={(e) => update(index, { title: e.target.value })}
                  className={adminInput}
                />
              </div>
              <div>
                <label className={adminLabel}>URL</label>
                <input
                  value={project.url}
                  onChange={(e) => update(index, { url: e.target.value })}
                  className={adminInput}
                />
              </div>
              <div>
                <label className={adminLabel}>Category label</label>
                <input
                  value={project.category}
                  onChange={(e) => update(index, { category: e.target.value })}
                  className={adminInput}
                  placeholder="Web Design · Branding"
                />
              </div>
              <div>
                <label className={adminLabel}>Watermark initials</label>
                <input
                  value={project.label}
                  maxLength={3}
                  onChange={(e) => update(index, { label: e.target.value.toUpperCase() })}
                  className={adminInput}
                />
              </div>
              <div>
                <label className={adminLabel}>Thumbnail path</label>
                <input
                  value={project.thumbnail ?? ''}
                  onChange={(e) =>
                    update(index, { thumbnail: e.target.value || undefined })
                  }
                  className={adminInput}
                  placeholder="/images/projects/example.png"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
              <div>
                <span className={adminLabel}>Filters</span>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => {
                    const on = project.categories.includes(cat as ProjectCategory);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(index, cat as ProjectCategory)}
                        aria-pressed={on}
                        className={cn(
                          'rounded-pill border px-3 py-1 font-head text-[10px] font-bold uppercase tracking-[0.1em] transition-colors',
                          on
                            ? 'border-gold bg-gold/15 text-gold'
                            : 'border-white/12 text-white/40 hover:text-white'
                        )}
                        style={{ minHeight: 'auto' }}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-sm text-fg-80">
                <input
                  type="checkbox"
                  checked={project.isLive}
                  onChange={(e) => update(index, { isLive: e.target.checked })}
                  className="h-4 w-4 accent-[#C9A227]"
                />
                Live badge
              </label>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <button type="button" onClick={save} disabled={saving} className={btnPrimary}>
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Save changes
        </button>
      </div>

      <ConfirmDialog
        open={confirmCategory.target !== null}
        busy={confirmCategory.busy}
        title={`Remove the "${confirmCategory.target ?? ''}" category?`}
        body={
          confirmCategory.target
            ? `${categoryUsage(confirmCategory.target)} project(s) currently use it, and it will be cleared from each of them. The filter button disappears from /work. Nothing is written until you press Save changes.`
            : ''
        }
        confirmLabel="Remove"
        onCancel={confirmCategory.cancel}
        onConfirm={() =>
          confirmCategory.run(async (cat) => {
            removeCategory(cat);
            toast.success(`Removed "${cat}"`);
          })
        }
      />

      <ConfirmDialog
        open={confirm.target !== null}
        busy={confirm.busy}
        title="Remove this project?"
        body="It will disappear from the editor. Nothing is written until you press Save changes."
        confirmLabel="Remove"
        onCancel={confirm.cancel}
        onConfirm={() =>
          confirm.run(async (index) => {
            setProjects((ps) => ps.filter((_, i) => i !== index));
          })
        }
      />
    </>
  );
}
