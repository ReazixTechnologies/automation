/**
 * Lightweight, consent-gated analytics. `track()` is a no-op until the
 * AnalyticsLoader installs a sink, which it only does after the visitor
 * accepts analytics cookies. Call sites never need to check consent.
 */

export type AnalyticsEvent =
  | "cta_click"
  | "demo_message_sent"
  | "demo_tool_shown"
  | "roi_calculated"
  | "faq_opened"
  | "lead_form_submitted"
  | "channel_toggled";

export type AnalyticsProps = Record<string, string | number | boolean | undefined>;
type Sink = (event: AnalyticsEvent, props: AnalyticsProps) => void;

let sink: Sink | null = null;

export function setAnalyticsSink(next: Sink | null) {
  sink = next;
}

export function track(event: AnalyticsEvent, props: AnalyticsProps = {}) {
  try {
    sink?.(event, props);
  } catch {
    /* analytics must never break the page */
  }
}
