import { doc, getDoc } from 'firebase/firestore';
import { db, COLLECTIONS } from '@/lib/firebase';
import { PROJECTS } from '@/lib/data/projects';
import type { Project, WorkPageContent } from '@/lib/types';

/**
 * Read-only work-page content.
 *
 * Deliberately separate from `lib/admin.ts`: that module imports
 * `firebase/auth`, and the public /work page has no business pulling the auth
 * SDK into its bundle just to read a document.
 *
 * Firestore is the source of truth WHEN it has content; otherwise the built-in
 * catalogue is used. That ordering matters — an empty or unreachable CMS must
 * never blank the public portfolio, which is exactly what would happen if we
 * rendered whatever Firestore returned.
 */
export interface ResolvedWorkContent {
  headerTitle?: string;
  headerDescription?: string;
  projects: Project[];
  /** True when falling back to the built-in catalogue. */
  isFallback: boolean;
}

export async function getPublicWorkContent(): Promise<ResolvedWorkContent> {
  try {
    const snap = await getDoc(doc(db(), COLLECTIONS.pageContent, 'work'));

    if (snap.exists()) {
      const data = snap.data() as WorkPageContent;

      if (Array.isArray(data.projects) && data.projects.length > 0) {
        return {
          headerTitle: data.headerTitle?.trim() || undefined,
          headerDescription: data.headerDescription?.trim() || undefined,
          projects: data.projects.filter((p) => p.isVisible !== false),
          isFallback: false,
        };
      }

      // Header copy can be overridden even when the project list is empty.
      return {
        headerTitle: data.headerTitle?.trim() || undefined,
        headerDescription: data.headerDescription?.trim() || undefined,
        projects: PROJECTS,
        isFallback: true,
      };
    }
  } catch (err) {
    console.warn('[work] CMS read failed, using the built-in catalogue:', err);
  }

  return { projects: PROJECTS, isFallback: true };
}
