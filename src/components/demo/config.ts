/** Desktop-only extras around the phone-sized chat: tiny Reazix logo + "Open on your phone" QR. */
export const SHOW_DESKTOP_EXTRAS = true;
/** Tiny "Powered by Reazix" line under the input, desktop only. Never shown on mobile. */
export const SHOW_POWERED_BY_DESKTOP = true;

export const REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"] as const;

/**
 * "typing…" before the first greeting. Trade-off: the greeting bubble is the
 * page's largest paint, so this delay is what Lighthouse reports as LCP.
 * Set to 0 for an instant greeting (LCP ≈ first paint, ~0.9s on simulated 4G).
 */
export const WELCOME_DELAY_MS = 900;
