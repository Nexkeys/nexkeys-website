import type { Timestamp, FieldValue } from 'firebase/firestore';

/* ═══════════════════════════════════════════════════════════
   INTERNSHIP
   ═══════════════════════════════════════════════════════════ */

/**
 * Track ids as used in the legacy vanilla code (assets/js/internship.js:7).
 * NOTE: `prompt` and `datascience` intentionally keep their legacy spelling —
 * renaming would orphan existing Firestore documents. See plan §17.4.
 */
export type TrackId =
  | 'frontend'
  | 'backend'
  | 'mobile'
  | 'devops'
  | 'uiux'
  | 'prompt'
  | 'automation'
  | 'datascience'
  | 'growth'
  | 'copywriting';

export interface Track {
  id: TrackId;
  /** The exact string written to Firestore `track` — do not change. */
  name: string;
  icon: string;
  question: string;
  /** Optional cover image from public/images/tracks/ */
  image?: string;
  blurb: string;
}

export type ApplicationStatus = 'pending' | 'shortlisted' | 'accepted' | 'rejected';

export type PreferredSchedule =
  | 'Morning (8am - 12pm)'
  | 'Afternoon (12pm - 4pm)'
  | 'Evening/Night (5pm - 9pm+)';

export interface InternshipApplication {
  id?: string;
  fullName: string;
  email: string;
  /**
   * Full international number, e.g. `+2348012345678`.
   *
   * The field name and type are UNCHANGED (plan N2) — existing documents and
   * the admin WhatsApp deep-link keep working untouched. The two fields below
   * are ADDITIVE and optional, so older applications simply lack them.
   */
  whatsapp: string;
  /** ISO 3166-1 alpha-2, e.g. `NG`. Absent on pre-global applications. */
  whatsappCountry?: string;
  /** Dial code without '+', e.g. `234`. Absent on pre-global applications. */
  whatsappDialCode?: string;
  location: string;
  preferredSchedule: PreferredSchedule | string;
  exactSyncHour: string;
  /** Stores the track NAME, not the id — legacy contract. See plan §17.4. */
  track: string;
  screeningAnswer: string;
  isCommitted: boolean;
  status: ApplicationStatus;
  submittedAt: Timestamp | FieldValue | string | null;
  updatedAt?: Timestamp | FieldValue | null;
}

export interface InternshipSettings {
  isHiringOpen: boolean;
  updatedAt?: Timestamp | FieldValue | null;
}

/* ═══════════════════════════════════════════════════════════
   BOOKINGS
   ═══════════════════════════════════════════════════════════ */

export interface Booking {
  id?: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  date: Timestamp | FieldValue | Date;
  dateString: string;
  time: string;
  timezone: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: Timestamp | FieldValue | null;
}

export interface BookingInput {
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  date: Date;
  time: string;
  timezone?: string;
}

export interface Availability {
  bookedSlots?: string[];
  /** Legacy shape — a list of what is still OPEN. */
  slots?: string[];
  lastBooked?: Timestamp | FieldValue | null;
}

/* ═══════════════════════════════════════════════════════════
   BLOG
   ═══════════════════════════════════════════════════════════ */

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  imageUrl: string;
  createdAt: Date | null;
  readingTime: number;
}

/** Raw Firestore shape before normalisation. */
export interface BlogPostDoc {
  title: string;
  summary: string;
  content: string;
  category?: string;
  imageUrl?: string;
  slug?: string;
  createdAt?: Timestamp | null;
}

/* ═══════════════════════════════════════════════════════════
   WORK / PROJECTS
   ═══════════════════════════════════════════════════════════ */

export type ProjectCategory =
  | 'web'
  | 'design'
  | 'fintech'
  | 'ecommerce'
  | 'gaming'
  | 'saas';

export interface Project {
  id: string;
  name: string;
  /** Short headline shown on the card. */
  title: string;
  category: string;
  categories: ProjectCategory[];
  url: string;
  /** Two-letter watermark. */
  label: string;
  isLive: boolean;
  /** Local thumbnail under /images/projects/. Falls back to thum.io. */
  thumbnail?: string;
  /** Gradient used when no thumbnail exists. */
  gradient: string;
  isVisible?: boolean;
}

/**
 * A long-form project write-up from the legacy /work page.
 *
 * Separate from `Project` (the card) because the two have different lifetimes:
 * cards are CMS-editable, these write-ups are ported copy keyed to a project id.
 */
export interface WorkDetail {
  /** Matches `Project.id`. */
  id: string;
  /** Display index, e.g. "01". */
  index: string;
  name: string;
  tags: string[];
  /** Body copy, already split on the source's paragraph breaks. */
  paragraphs: string[];
  url: string;
  label: string;
}

export interface WorkPageContent {
  headerTitle?: string;
  headerDescription?: string;
  filterCategories?: string[];
  projects?: Project[];
}

/* ═══════════════════════════════════════════════════════════
   CONTENT
   ═══════════════════════════════════════════════════════════ */

export interface Testimonial {
  id: string;
  quote: string;
  /** Substrings of `quote` to render in white/bold. */
  highlights?: string[];
  name: string;
  role: string;
  initial: string;
  stars: number;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  tags: string[];
  icon: string;
  image?: string;
  /** Grid span on the bento layout. */
  span?: 'wide' | 'tall' | 'feature';
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo: string;
  skills: string[];
  links: { label: string; href: string; kind: 'linkedin' | 'portfolio' }[];
}

export interface ProcessStep {
  num: string;
  title: string;
  description: string;
}

/* ═══════════════════════════════════════════════════════════
   LEGAL DOCUMENTS
   Shape produced by scripts/extract-legal.mjs.

   Copy is modelled as typed INLINE NODES rather than HTML strings so the
   renderer never needs `dangerouslySetInnerHTML` — React escapes children by
   construction (plan N24).
   ═══════════════════════════════════════════════════════════ */

export type LegalInline =
  | { t: 's'; text: string }
  | { t: 'b'; text: string }
  | { t: 'i'; text: string }
  | { t: 'a'; text: string; href: string }
  | { t: 'br' };

export type LegalBlock =
  | { type: 'h3'; text: string }
  | { type: 'h4'; text: string }
  | { type: 'p'; nodes: LegalInline[] }
  | { type: 'ul'; items: LegalInline[][] }
  | { type: 'ol'; items: LegalInline[][] }
  | { type: 'callout'; blocks: LegalBlock[] }
  | { type: 'contactCard'; rows: { icon: string; nodes: LegalInline[] }[] }
  | { type: 'table'; head: string[]; rows: string[][] };

export interface LegalSection {
  id: string;
  num: string;
  heading: string;
  blocks: LegalBlock[];
}

export interface LegalDocument {
  slug: string;
  title: string;
  intro: string;
  meta: { label: string; value: string }[];
  sections: LegalSection[];
}
