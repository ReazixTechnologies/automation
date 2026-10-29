/**
 * Cookie consent, stored per browser. Storage can be unavailable (private
 * mode, blocked site data), so every access is guarded and the page works
 * without it: no stored choice simply means "not decided yet".
 */

export interface Consent {
  /** Essential cookies are always on; this covers analytics only. */
  analytics: boolean;
  decided: boolean;
}

const KEY = "concierra-consent-v1";
export const CONSENT_CHANGE_EVENT = "consent:change";
export const CONSENT_OPEN_EVENT = "consent:open";

export const DEFAULT_CONSENT: Consent = { analytics: false, decided: false };

export function readConsent(): Consent {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_CONSENT;
    const parsed = JSON.parse(raw) as Partial<Consent>;
    return { analytics: parsed.analytics === true, decided: true };
  } catch {
    return DEFAULT_CONSENT;
  }
}

export function saveConsent(analytics: boolean) {
  const consent: Consent = { analytics, decided: true };
  try {
    localStorage.setItem(KEY, JSON.stringify({ analytics }));
  } catch {
    /* storage unavailable: the choice lasts for this page view */
  }
  window.dispatchEvent(new CustomEvent<Consent>(CONSENT_CHANGE_EVENT, { detail: consent }));
}

/** Re-open the cookie banner (footer "Cookie settings"). */
export function openCookieSettings() {
  window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
}
