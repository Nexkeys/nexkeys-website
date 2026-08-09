/**
 * Cookie consent state.
 *
 * Kept separate from the banner component so that anything which might set a
 * non-essential cookie can ask about consent without importing UI.
 *
 * WHAT REJECTING ACTUALLY DOES TODAY
 * As of now this site sets **no** tracking or advertising cookies. Firebase
 * Analytics is deliberately not initialised — `lib/firebase.ts` only calls
 * `getFirestore()` and `getAuth()`, and the `measurementId` in the config is
 * unused (plan O17). So "reject" currently has nothing to switch off.
 *
 * That is precisely why `hasAnalyticsConsent()` exists: the moment analytics is
 * added, it MUST be gated on this, or the reject button becomes a lie. A reject
 * button that silently does nothing is worse than no reject button at all.
 *
 * The consent record itself is strictly necessary — it is what stops us asking
 * again on every page — so it is stored regardless of the answer.
 */

export type ConsentChoice = 'accepted' | 'rejected';

const STORAGE_KEY = 'cookieConsent';

/** Fired on the window whenever the choice changes, so listeners can react. */
export const CONSENT_EVENT = 'nk:consent-change';

export function getConsent(): ConsentChoice | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    // Earlier builds stored the string 'true' for "accepted". Honour it so
    // returning visitors are not asked a second time.
    if (raw === 'true' || raw === 'accepted') return 'accepted';
    if (raw === 'rejected') return 'rejected';

    return null;
  } catch {
    // Storage blocked (private mode, or cookies disabled at the browser level).
    return null;
  }
}

export function setConsent(choice: ConsentChoice): void {
  try {
    localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    /* Storage unavailable — the banner still closes for this session. */
  }

  try {
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: choice }));
  } catch {
    /* ignore */
  }
}

/**
 * Gate for any analytics or other non-essential script.
 *
 * Defaults to FALSE when no choice has been made — opt-in, not opt-out. Under
 * NDPR and GDPR, silence is not consent.
 */
export function hasAnalyticsConsent(): boolean {
  return getConsent() === 'accepted';
}
