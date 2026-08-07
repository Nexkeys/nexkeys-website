import {
  collection,
  doc,
  getDoc,
  serverTimestamp,
  Timestamp,
  writeBatch,
  arrayUnion,
} from 'firebase/firestore';
import { db, COLLECTIONS } from '@/lib/firebase';
import type { Availability, BookingInput } from '@/lib/types';

/**
 * Discovery-call booking.
 *
 * SCHEMA IS FROZEN (plan N2). Every field name below matches the legacy
 * firebase-config.js exactly, so existing production documents keep working
 * with no migration:
 *
 *   bookings/{auto}              name, email, phone, notes, date (Timestamp),
 *                                dateString, time, timezone, status, createdAt
 *   availability/{YYYY-MM-DD}    bookedSlots[] (preferred) | slots[] (legacy),
 *                                lastBooked
 */

/** The 16 slots offered, in the order the legacy calendar rendered them. */
export const TIME_SLOTS = [
  '9:00 AM',
  '9:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '1:00 PM',
  '2:00 PM',
  '2:30 PM',
  '3:00 PM',
  '3:30 PM',
  '4:00 PM',
  '4:30 PM',
  '5:00 PM',
] as const;

export type TimeSlot = (typeof TIME_SLOTS)[number];

/** `YYYY-MM-DD` in LOCAL time — `toISOString()` would shift the day in some zones. */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Slots already taken for a given day.
 *
 * Handles BOTH historical shapes. `bookedSlots` lists what is taken;
 * the older `slots` field listed what remained OPEN — so it has to be
 * inverted, not read directly. Getting this backwards would silently
 * offer slots that are already booked.
 */
export async function getBookedSlots(date: Date): Promise<string[]> {
  try {
    const snap = await getDoc(doc(db(), COLLECTIONS.availability, toDateKey(date)));
    if (!snap.exists()) return [];

    const data = snap.data() as Availability;

    if (Array.isArray(data.bookedSlots)) return data.bookedSlots;

    if (Array.isArray(data.slots)) {
      const open = new Set(data.slots);
      return TIME_SLOTS.filter((slot) => !open.has(slot));
    }

    return [];
  } catch (err) {
    console.warn('[bookings] availability read failed:', err);
    // Fail OPEN rather than showing a fully-booked day on a transient error.
    return [];
  }
}

export function availableSlots(booked: string[]): string[] {
  const taken = new Set(booked);
  return TIME_SLOTS.filter((slot) => !taken.has(slot));
}

/**
 * Writes the booking and marks the slot taken in ONE batch, so a booking can
 * never exist without its availability record (or the reverse).
 */
export async function createBooking(input: BookingInput): Promise<string> {
  const dateKey = toDateKey(input.date);
  const database = db();

  const batch = writeBatch(database);

  const bookingRef = doc(collection(database, COLLECTIONS.bookings));
  batch.set(bookingRef, {
    name: input.name,
    email: input.email,
    phone: input.phone ?? '',
    notes: input.notes ?? '',
    date: Timestamp.fromDate(input.date),
    dateString: dateKey,
    time: input.time,
    timezone:
      input.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC',
    status: 'confirmed',
    createdAt: serverTimestamp(),
  });

  const availabilityRef = doc(database, COLLECTIONS.availability, dateKey);
  batch.set(
    availabilityRef,
    { bookedSlots: arrayUnion(input.time), lastBooked: serverTimestamp() },
    { merge: true }
  );

  await batch.commit();
  return bookingRef.id;
}

/** Weekends closed and no past dates — matches the legacy calendar. */
export function isSelectableDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const candidate = new Date(date);
  candidate.setHours(0, 0, 0, 0);

  if (candidate < today) return false;

  const day = candidate.getDay();
  return day !== 0 && day !== 6;
}

/**
 * `.ics` download so the call lands in the visitor's calendar (plan O8).
 * Assumes a 30-minute discovery call.
 */
export function buildIcs(opts: {
  date: Date;
  time: string;
  name: string;
  organiserEmail: string;
}): string {
  const start = parseSlotToDate(opts.date, opts.time);
  const end = new Date(start.getTime() + 30 * 60 * 1000);

  const stamp = (d: Date) =>
    d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//NexKeys Agency//Booking//EN',
    'BEGIN:VEVENT',
    `UID:${stamp(start)}-${Math.random().toString(36).slice(2)}@nexkeysagency.com.ng`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    'SUMMARY:Discovery Call — NexKeys Agency',
    `DESCRIPTION:A 30-minute discovery call with NexKeys Agency for ${opts.name}.`,
    `ORGANIZER;CN=NexKeys Agency:mailto:${opts.organiserEmail}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/** "2:30 PM" + a date → a Date at that local time. */
export function parseSlotToDate(date: Date, slot: string): Date {
  const match = slot.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  const result = new Date(date);

  if (!match) {
    result.setHours(9, 0, 0, 0);
    return result;
  }

  let hours = Number(match[1]) % 12;
  const minutes = Number(match[2]);
  if (match[3].toUpperCase() === 'PM') hours += 12;

  result.setHours(hours, minutes, 0, 0);
  return result;
}
