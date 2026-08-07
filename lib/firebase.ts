import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

/**
 * Firebase — same project, same collections, same field names as the legacy
 * site (plan N2). Migrated from the compat SDK to modular v10 (tree-shaken).
 *
 * These values are public by design: Firebase web config is not a secret.
 * Access control lives entirely in Firestore Security Rules — re-verify them
 * before launch (plan N27).
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? 'AIzaSyAbZNmdruqdYyyDcOBdMW4yjKxb9KbVSJo',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'nexkeys-e3f16.firebaseapp.com',
  databaseURL:
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ?? 'https://nexkeys-e3f16-default-rtdb.firebaseio.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'nexkeys-e3f16',
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'nexkeys-e3f16.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '489921307669',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '1:489921307669:web:bb689ebb49f1ea44481a1c',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? 'G-ZTTG35QDH1',
};

let app: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;
let authInstance: Auth | null = null;

function getFirebaseApp(): FirebaseApp {
  if (app) return app;
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return app;
}

export function db(): Firestore {
  if (!dbInstance) dbInstance = getFirestore(getFirebaseApp());
  return dbInstance;
}

export function auth(): Auth {
  if (!authInstance) authInstance = getAuth(getFirebaseApp());
  return authInstance;
}

/** Collection names — single source of truth. Do not change (plan N2). */
export const COLLECTIONS = {
  bookings: 'bookings',
  availability: 'availability',
  blogPosts: 'blogPosts',
  pageContent: 'pageContent',
  internshipApplications: 'internshipApplications',
  internshipWaitlist: 'internshipWaitlist',
  settings: 'settings',
} as const;
