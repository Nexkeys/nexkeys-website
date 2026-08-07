'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Loader2, Lock, LockOpen, RefreshCw, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  KNOWN_COLLECTIONS,
  deleteRawDoc,
  listCollection,
  saveRawDoc,
  type RawDoc,
} from '@/lib/admin';
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

/**
 * Raw Firestore viewer — kept, but guarded (plan D8 / §9.2 #11).
 *
 * The legacy `saveDocument()` at admin.js:719 wrote arbitrary fields to
 * arbitrary collections with no schema guard, no validation and no
 * confirmation. It is genuinely useful and genuinely dangerous, so:
 *
 *   · READ-ONLY by default. Writing requires an explicit unlock.
 *   · JSON is validated before any write is attempted.
 *   · Every destructive action goes through a confirm dialog naming the doc.
 */
export default function AdminFirestorePage() {
  const [collectionName, setCollectionName] = useState<string>(KNOWN_COLLECTIONS[0]);
  const [custom, setCustom] = useState('');
  const [docs, setDocs] = useState<RawDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [writeMode, setWriteMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [saving, setSaving] = useState(false);

  const confirm = useConfirm<RawDoc>();

  const active = custom.trim() || collectionName;

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    setEditingId(null);
    try {
      setDocs(await listCollection(active, 50));
    } catch (err) {
      console.error('[admin] collection load failed:', err);
      setError(
        err instanceof Error
          ? err.message
          : `Could not read the "${active}" collection.`
      );
      setDocs([]);
    } finally {
      setLoading(false);
    }
  }, [active]);

  useEffect(() => {
    void load();
  }, [load]);

  const startEdit = (item: RawDoc) => {
    setEditingId(item.id);
    setDraft(JSON.stringify(item.data, null, 2));
    setJsonError('');
  };

  const save = async () => {
    if (!editingId) return;

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(draft);
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : 'Invalid JSON.');
      return;
    }
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      setJsonError('The document must be a JSON object.');
      return;
    }

    setSaving(true);
    try {
      await saveRawDoc(active, editingId, parsed);
      toast.success('Document saved');
      setEditingId(null);
      await load();
    } catch (err) {
      console.error('[admin] raw save failed:', err);
      toast.error('Could not save the document.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AdminHeader
        title="Firestore Viewer"
        description="Direct access to the database. Read-only until unlocked."
        actions={
          <button type="button" onClick={load} className={btnGhost}>
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        }
      />

      {/* ── Write-mode gate ──────────────────────────────── */}
      <div
        className={cn(
          'mb-6 flex flex-col gap-4 rounded-card border p-5 sm:flex-row sm:items-center sm:justify-between',
          writeMode
            ? 'border-destructive/40 bg-destructive/[0.06]'
            : 'border-gold/15 bg-bg-2'
        )}
      >
        <div className="flex items-start gap-3">
          {writeMode ? (
            <AlertTriangle
              className="mt-0.5 h-5 w-5 shrink-0 text-destructive"
              aria-hidden="true"
            />
          ) : (
            <Lock className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
          )}
          <div>
            <p className="font-head text-sm font-bold text-white">
              {writeMode ? 'Write mode is ON' : 'Read-only mode'}
            </p>
            <p className="mt-1 text-sm text-fg-60">
              {writeMode
                ? 'Edits and deletions here are immediate, unvalidated against any schema, and cannot be undone.'
                : 'Browse safely. Unlock to edit or delete documents.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setWriteMode((w) => !w);
            setEditingId(null);
          }}
          className={writeMode ? btnGhost : btnPrimary}
        >
          {writeMode ? (
            <>
              <Lock className="h-3.5 w-3.5" />
              Lock
            </>
          ) : (
            <>
              <LockOpen className="h-3.5 w-3.5" />
              Unlock write mode
            </>
          )}
        </button>
      </div>

      {/* ── Collection picker ────────────────────────────── */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="fs-collection" className={adminLabel}>
            Known collection
          </label>
          <select
            id="fs-collection"
            value={collectionName}
            onChange={(e) => {
              setCollectionName(e.target.value);
              setCustom('');
            }}
            className={adminInput}
          >
            {KNOWN_COLLECTIONS.map((c) => (
              <option key={c} value={c} className="bg-bg-2">
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="fs-custom" className={adminLabel}>
            Or type a collection name
          </label>
          <input
            id="fs-custom"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            className={adminInput}
            placeholder="e.g. internshipWaitlist"
          />
        </div>
      </div>

      <p className="mb-4 text-xs text-white/35">
        Reading <span className="text-gold">{active}</span> · showing up to 50 documents
      </p>

      {loading ? (
        <AdminLoading label={`Reading ${active}…`} />
      ) : error ? (
        <AdminError message={error} onRetry={load} />
      ) : docs.length === 0 ? (
        <p className="rounded-card border border-gold/12 bg-bg-2 py-16 text-center text-sm text-fg-40">
          No documents in this collection.
        </p>
      ) : (
        <ul className="space-y-3">
          {docs.map((item) => (
            <li
              key={item.id}
              className="rounded-card border border-gold/12 bg-bg-2 p-4 sm:p-5"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <code className="break-all font-mono text-xs text-gold">{item.id}</code>

                {writeMode && (
                  <div className="flex gap-2">
                    {editingId === item.id ? (
                      <>
                        <button
                          type="button"
                          onClick={save}
                          disabled={saving}
                          className={cn(btnPrimary, 'px-3 py-1.5')}
                        >
                          {saving ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Save className="h-3.5 w-3.5" />
                          )}
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className={cn(btnGhost, 'px-3 py-1.5')}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className={cn(btnGhost, 'px-3 py-1.5')}
                      >
                        Edit
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => confirm.ask(item)}
                      aria-label={`Delete document ${item.id}`}
                      className="rounded-lg p-2 text-white/35 transition-colors hover:bg-destructive/10 hover:text-destructive"
                      style={{ minHeight: 'auto' }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {editingId === item.id ? (
                <>
                  <textarea
                    value={draft}
                    onChange={(e) => {
                      setDraft(e.target.value);
                      setJsonError('');
                    }}
                    rows={14}
                    spellCheck={false}
                    aria-label={`JSON for document ${item.id}`}
                    className={cn(adminInput, 'resize-y font-mono text-[12px] leading-relaxed')}
                  />
                  {jsonError && (
                    <p role="alert" className="mt-2 text-xs text-destructive">
                      Invalid JSON — {jsonError}
                    </p>
                  )}
                </>
              ) : (
                <pre className="scroll-x max-h-64 overflow-y-auto rounded-lg border border-white/8 bg-bg p-3 font-mono text-[12px] leading-relaxed text-fg-60">
                  {JSON.stringify(item.data, null, 2)}
                </pre>
              )}
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={confirm.target !== null}
        busy={confirm.busy}
        title="Delete this document?"
        body={`Document "${confirm.target?.id ?? ''}" will be permanently removed from the "${active}" collection. There is no undo and no backup.`}
        onCancel={confirm.cancel}
        onConfirm={() =>
          confirm.run(async (item) => {
            try {
              await deleteRawDoc(active, item.id);
              setDocs((ds) => ds.filter((d) => d.id !== item.id));
              toast.success('Document deleted');
            } catch (err) {
              console.error('[admin] raw delete failed:', err);
              toast.error('Could not delete the document.');
            }
          })
        }
      />
    </>
  );
}
