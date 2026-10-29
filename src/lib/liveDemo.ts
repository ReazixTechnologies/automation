/**
 * Tiny cross-section API: any component can place a starter message in the
 * live demo's input. useChat listens for this event.
 */
export const LIVE_DEMO_PREFILL_EVENT = "concierge:prefill";

export interface LiveDemoPrefill {
  text: string;
  /** Changes on every request so the same text can be prefilled twice. */
  id: number;
}

export function prefillLiveDemo(text: string) {
  window.dispatchEvent(new CustomEvent<{ text: string }>(LIVE_DEMO_PREFILL_EVENT, { detail: { text } }));
}
