import type { MouseEvent } from "react";

export type DemoChannel = "whatsapp" | "instagram";

/** URL of a standalone demo chat, optionally with a first message (?q=) and project (?project=). */
export function demoUrl(channel: DemoChannel, q?: string, project?: string) {
  const sp = new URLSearchParams();
  if (q) sp.set("q", q);
  if (project) sp.set("project", project);
  const qs = sp.toString();
  return `/demo/${channel}${qs ? `?${qs}` : ""}`;
}

/**
 * Click handler for demo links: a new tab on desktop (the page stays put),
 * the same tab on phones (where tabs get in the way). Keeps the plain href
 * as the no-JS fallback.
 */
export function openDemo(e: MouseEvent<HTMLAnchorElement>) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  const mobile = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
  if (mobile) return; // default navigation in the same tab
  e.preventDefault();
  window.open(e.currentTarget.href, "_blank", "noopener");
}
