import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db, COLLECTIONS } from '@/lib/firebase';
import type { ApplicationStatus, InternshipApplication } from '@/lib/types';

/**
 * Reads `settings/internship.isHiringOpen`.
 * Defaults to OPEN when the doc is missing or unreadable — matches the legacy
 * behaviour in internship.js:73–85 so a Firestore hiccup never hides the form.
 */
export async function getHiringOpen(): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db(), COLLECTIONS.settings, 'internship'));
    const data = snap.data();
    if (snap.exists() && data && typeof data.isHiringOpen === 'boolean') {
      return data.isHiringOpen;
    }
  } catch (err) {
    console.warn('[internship] hiring-state read failed, defaulting to open:', err);
  }
  return true;
}

export async function setHiringOpen(isOpen: boolean): Promise<void> {
  await setDoc(
    doc(db(), COLLECTIONS.settings, 'internship'),
    { isHiringOpen: isOpen, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export type ApplicationPayload = Omit<InternshipApplication, 'id' | 'submittedAt' | 'status'>;

export async function submitApplication(payload: ApplicationPayload): Promise<string> {
  const ref = await addDoc(collection(db(), COLLECTIONS.internshipApplications), {
    ...payload,
    status: 'pending' satisfies ApplicationStatus,
    submittedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function joinWaitlist(email: string): Promise<void> {
  await addDoc(collection(db(), COLLECTIONS.internshipWaitlist), {
    email,
    submittedAt: serverTimestamp(),
  });
}

export async function listApplications(): Promise<InternshipApplication[]> {
  const q = query(
    collection(db(), COLLECTIONS.internshipApplications),
    orderBy('submittedAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as InternshipApplication);
}

export async function updateApplicantStatus(
  id: string,
  status: ApplicationStatus
): Promise<void> {
  await updateDoc(doc(db(), COLLECTIONS.internshipApplications, id), {
    status,
    updatedAt: serverTimestamp(),
  });
}
