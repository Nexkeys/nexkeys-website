'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { Eye, FilePlus2, Loader2, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  createBlogPost,
  deleteBlogPost,
  listBlogPosts,
  updateBlogPost,
  type BlogInput,
  type BlogRow,
} from '@/lib/admin';
import { readingTime, slugify, toParagraphs } from '@/lib/blog';
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

const EMPTY: BlogInput = {
  title: '',
  summary: '',
  content: '',
  category: '',
  imageUrl: '',
  slug: '',
};

export default function AdminBlogPage() {
  const [rows, setRows] = useState<BlogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BlogInput>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  const confirm = useConfirm<BlogRow>();

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setRows(await listBlogPosts(200));
    } catch (err) {
      console.error('[admin] blog load failed:', err);
      setError(err instanceof Error ? err.message : 'Could not load posts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const set = <K extends keyof BlogInput>(key: K, value: BlogInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const reset = () => {
    setForm(EMPTY);
    setEditingId(null);
    setPreview(false);
  };

  const edit = (row: BlogRow) => {
    setEditingId(row.id);
    setForm({
      title: row.title ?? '',
      summary: row.summary ?? '',
      content: row.content ?? '',
      category: row.category ?? '',
      imageUrl: row.imageUrl ?? '',
      slug: row.slug ?? '',
    });
    setPreview(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('A title is required.');
    if (!form.content.trim()) return toast.error('The post has no content.');

    setSaving(true);
    try {
      if (editingId) {
        await updateBlogPost(editingId, form);
        toast.success('Post updated');
      } else {
        await createBlogPost(form);
        toast.success('Post published');
      }
      reset();
      await load();
    } catch (err) {
      console.error('[admin] blog save failed:', err);
      toast.error('Could not save the post.');
    } finally {
      setSaving(false);
    }
  };

  /* The slug the public route will actually use — mirrors lib/blog.ts. */
  const effectiveSlug = form.slug?.trim() || slugify(form.title) || '…';

  return (
    <>
      <AdminHeader
        title="Blog Manager"
        description="Write, edit and publish. Posts appear at /blog within five minutes."
        actions={
          editingId ? (
            <button type="button" onClick={reset} className={btnGhost}>
              <FilePlus2 className="h-3.5 w-3.5" />
              New post
            </button>
          ) : undefined
        }
      />

      {/* ── Editor ───────────────────────────────────────── */}
      <form
        onSubmit={save}
        className="mb-10 rounded-card border border-gold/12 bg-bg-2 p-5 sm:p-7"
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="font-head text-sm font-bold text-white">
            {editingId ? 'Editing post' : 'New post'}
          </h2>
          <button
            type="button"
            onClick={() => setPreview((p) => !p)}
            className={cn(btnGhost, 'px-3 py-1.5')}
            aria-pressed={preview}
          >
            <Eye className="h-3.5 w-3.5" />
            {preview ? 'Edit' : 'Preview'}
          </button>
        </div>

        {preview ? (
          /* Live preview (plan O11) — renders exactly as the public page does,
             through React children. No innerHTML anywhere. */
          <div className="rounded-xl border border-white/10 bg-bg p-6">
            <p className="font-head text-[10px] font-bold uppercase tracking-[0.14em] text-gold">
              {form.category || 'Uncategorised'}
            </p>
            <h3 className="mt-3 font-head text-h3 font-bold text-white">
              {form.title || 'Untitled'}
            </h3>
            <p className="mt-1 text-xs text-white/35">
              /blog/{effectiveSlug} · {readingTime(form.content)} min read
            </p>
            {form.summary && <p className="mt-4 text-sm text-fg-60">{form.summary}</p>}
            <div className="mt-5 measure">
              {toParagraphs(form.content).map((p, i) => (
                <p key={i} className="mb-4 text-[14.5px] leading-[1.85] text-fg-80">
                  {p}
                </p>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="bl-title" className={adminLabel}>
                  Title *
                </label>
                <input
                  id="bl-title"
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  className={adminInput}
                  placeholder="How we cut a build time in half"
                />
              </div>

              <div>
                <label htmlFor="bl-category" className={adminLabel}>
                  Category
                </label>
                <input
                  id="bl-category"
                  value={form.category ?? ''}
                  onChange={(e) => set('category', e.target.value)}
                  className={adminInput}
                  placeholder="Engineering"
                />
              </div>
            </div>

            <div>
              <label htmlFor="bl-slug" className={adminLabel}>
                Slug
              </label>
              <input
                id="bl-slug"
                value={form.slug ?? ''}
                onChange={(e) => set('slug', e.target.value)}
                className={adminInput}
                placeholder="Leave blank to generate from the title"
              />
              <p className="mt-1.5 text-xs text-white/35">
                Public URL: <span className="text-gold">/blog/{effectiveSlug}</span>
              </p>
            </div>

            <div>
              <label htmlFor="bl-summary" className={adminLabel}>
                Summary
              </label>
              <textarea
                id="bl-summary"
                rows={2}
                value={form.summary ?? ''}
                onChange={(e) => set('summary', e.target.value)}
                className={cn(adminInput, 'resize-y')}
                placeholder="One or two sentences — used on cards and in search results."
              />
            </div>

            <div>
              <label htmlFor="bl-image" className={adminLabel}>
                Cover image URL
              </label>
              <input
                id="bl-image"
                value={form.imageUrl ?? ''}
                onChange={(e) => set('imageUrl', e.target.value)}
                className={adminInput}
                placeholder="https://… — leave blank to use a house cover"
              />
              {form.imageUrl && (
                <div className="relative mt-3 aspect-[16/7] w-full max-w-xs overflow-hidden rounded-lg border border-white/10">
                  <Image
                    src={form.imageUrl}
                    alt=""
                    fill
                    sizes="320px"
                    className="object-cover"
                  />
                </div>
              )}
            </div>

            <div>
              <label htmlFor="bl-content" className={adminLabel}>
                Content *
              </label>
              <textarea
                id="bl-content"
                rows={12}
                value={form.content}
                onChange={(e) => set('content', e.target.value)}
                className={cn(adminInput, 'resize-y font-mono text-[13px] leading-relaxed')}
                placeholder="Separate paragraphs with a blank line."
              />
              <p className="mt-1.5 text-xs text-white/35">
                {readingTime(form.content)} min read · paragraphs are split on blank lines
              </p>
            </div>
          </div>
        )}

        <div className="mt-7 flex flex-wrap gap-3">
          <button type="submit" disabled={saving} className={btnPrimary}>
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {editingId ? 'Save changes' : 'Publish post'}
          </button>
          {editingId && (
            <button type="button" onClick={reset} className={btnGhost}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* ── List ─────────────────────────────────────────── */}
      <h2 className="mb-4 font-head text-sm font-bold text-white">
        Published posts {rows.length > 0 && `(${rows.length})`}
      </h2>

      {loading ? (
        <AdminLoading label="Loading posts…" />
      ) : error ? (
        <AdminError message={error} onRetry={load} />
      ) : rows.length === 0 ? (
        <p className="rounded-card border border-gold/12 bg-bg-2 py-16 text-center text-sm text-fg-40">
          Nothing published yet.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-3">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex flex-col gap-3 rounded-card border border-gold/12 bg-bg-2 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">
                  {row.title || 'Untitled'}
                </p>
                <p className="truncate text-xs text-white/40">
                  {row.category || 'Uncategorised'} · /blog/
                  {row.slug || slugify(row.title ?? '')}
                </p>
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => edit(row)}
                  className={cn(btnGhost, 'px-3 py-1.5')}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => confirm.ask(row)}
                  aria-label={`Delete ${row.title}`}
                  className="rounded-lg p-2 text-white/35 transition-colors hover:bg-destructive/10 hover:text-destructive"
                  style={{ minHeight: 'auto' }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={confirm.target !== null}
        busy={confirm.busy}
        title="Delete this post?"
        body={`“${confirm.target?.title ?? ''}” will be permanently removed from the blog. Any link to it will start returning 404. This cannot be undone.`}
        onCancel={confirm.cancel}
        onConfirm={() =>
          confirm.run(async (row) => {
            try {
              await deleteBlogPost(row.id);
              setRows((rs) => rs.filter((r) => r.id !== row.id));
              if (editingId === row.id) reset();
              toast.success('Post deleted');
            } catch (err) {
              console.error('[admin] blog delete failed:', err);
              toast.error('Could not delete the post.');
            }
          })
        }
      />
    </>
  );
}
