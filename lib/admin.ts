import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit as fsLimit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';

import { auth, db, COLLECTIONS } from '@/lib/firebase';
import { slugify } from '@/lib/blog';
import type { Booking, BlogPostDoc, Project, WorkPageContent } from '@/lib/types';

/* ═══════════════════════════════════════════════════════════
   AUTH
   ═══════════════════════════════════════════════════════════ */

export function watchAuth(cb: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth(), cb);
}

export async function signIn(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth(), email, password);
}

export async function signOut(): Promise<void> {
  await fbSignOut(auth());
}

/* ═══════════════════════════════════════════════════════════
   BOOKINGS
   ═══════════════════════════════════════════════════════════ */

export interface BookingRow extends Booking {
  id: string;
}

/**
 * Paged rather than unbounded. `loadBookings()` in the legacy admin.js:140
 * fetched the ENTIRE collection with `.orderBy().get()` on every tab switch
 * (plan §9.2 #8) — fine at ten bookings, ruinous at ten thousand.
 */
export async function listBookings(max = 100): Promise<BookingRow[]> {
  const q = query(
    collection(db(), COLLECTIONS.bookings),
    orderBy('createdAt', 'desc'),
    fsLimit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Booking) }));
}

export async function updateBookingStatus(
  id: string,
  status: Booking['status']
): Promise<void> {
  await updateDoc(doc(db(), COLLECTIONS.bookings, id), { status });
}

export async function deleteBooking(id: string): Promise<void> {
  await deleteDoc(doc(db(), COLLECTIONS.bookings, id));
}

/* ═══════════════════════════════════════════════════════════
   BLOG
   ═══════════════════════════════════════════════════════════ */

export interface BlogRow extends BlogPostDoc {
  id: string;
}

export async function listBlogPosts(max = 100): Promise<BlogRow[]> {
  const q = query(
    collection(db(), COLLECTIONS.blogPosts),
    orderBy('createdAt', 'desc'),
    fsLimit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as BlogPostDoc) }));
}

export type BlogInput = Omit<BlogPostDoc, 'createdAt'>;

export async function createBlogPost(input: BlogInput): Promise<string> {
  const ref = await addDoc(collection(db(), COLLECTIONS.blogPosts), {
    ...input,
    // A stored slug is what the public /blog/[slug] route prefers.
    slug: input.slug?.trim() || slugify(input.title),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateBlogPost(id: string, input: BlogInput): Promise<void> {
  await updateDoc(doc(db(), COLLECTIONS.blogPosts, id), {
    ...input,
    slug: input.slug?.trim() || slugify(input.title),
  });
}

export async function deleteBlogPost(id: string): Promise<void> {
  await deleteDoc(doc(db(), COLLECTIONS.blogPosts, id));
}

/* ═══════════════════════════════════════════════════════════
   WORK PAGE CONTENT
   ═══════════════════════════════════════════════════════════ */

export async function getWorkContent(): Promise<WorkPageContent | null> {
  const snap = await getDoc(doc(db(), COLLECTIONS.pageContent, 'work'));
  return snap.exists() ? (snap.data() as WorkPageContent) : null;
}

export async function saveWorkContent(content: WorkPageContent): Promise<void> {
  await setDoc(doc(db(), COLLECTIONS.pageContent, 'work'), content, { merge: true });
}

export async function saveWorkProjects(projects: Project[]): Promise<void> {
  await setDoc(
    doc(db(), COLLECTIONS.pageContent, 'work'),
    { projects },
    { merge: true }
  );
}

/* ═══════════════════════════════════════════════════════════
   GENERIC FIRESTORE VIEWER
   ═══════════════════════════════════════════════════════════ */

/** Collections the viewer offers. Arbitrary names are still allowed. */
export const KNOWN_COLLECTIONS = Object.values(COLLECTIONS);

export interface RawDoc {
  id: string;
  data: DocumentData;
}

export async function listCollection(name: string, max = 50): Promise<RawDoc[]> {
  const snap = await getDocs(query(collection(db(), name), fsLimit(max)));
  return snap.docs.map((d) => ({ id: d.id, data: d.data() }));
}

export async function saveRawDoc(
  collectionName: string,
  id: string,
  data: DocumentData
): Promise<void> {
  await setDoc(doc(db(), collectionName, id), data, { merge: true });
}

export async function deleteRawDoc(collectionName: string, id: string): Promise<void> {
  await deleteDoc(doc(db(), collectionName, id));
}

/* ═══════════════════════════════════════════════════════════
   CSV EXPORT (plan O13)
   ═══════════════════════════════════════════════════════════ */

/**
 * RFC-4180 quoting. The leading-character guard defuses CSV injection: a cell
 * beginning `=`, `+`, `-` or `@` is executed as a formula by Excel and Sheets,
 * and these tables contain values typed by the public.
 */
function csvCell(value: unknown): string {
  let text = value == null ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const head = columns.map(csvCell).join(',');
  const body = rows.map((r) => columns.map((c) => csvCell(r[c])).join(',')).join('\r\n');
  return `${head}\r\n${body}`;
}

export function downloadCsv(filename: string, csv: string): void {
  // The BOM makes Excel read it as UTF-8 rather than the local codepage.
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
