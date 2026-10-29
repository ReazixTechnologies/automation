/**
 * Simple in-memory fixed-window limiter, per IP. Good enough for one server
 * instance; on serverless or multiple instances swap for a shared store
 * (e.g. @upstash/ratelimit) behind the same `checkRateLimit` signature.
 */
import { RATE_LIMITS } from "@/lib/ai/config";

interface Window {
  minuteStart: number;
  minuteCount: number;
  dayStart: number;
  dayCount: number;
}

const MINUTE = 60_000;
const DAY = 86_400_000;
const buckets = new Map<string, Window>();

export type RateLimitResult = { ok: true } | { ok: false; scope: "minute" | "day"; retryAfterSec: number };

export function checkRateLimit(key: string, now = Date.now()): RateLimitResult {
  let w = buckets.get(key);
  if (!w) {
    w = { minuteStart: now, minuteCount: 0, dayStart: now, dayCount: 0 };
    buckets.set(key, w);
  }
  if (now - w.minuteStart >= MINUTE) {
    w.minuteStart = now;
    w.minuteCount = 0;
  }
  if (now - w.dayStart >= DAY) {
    w.dayStart = now;
    w.dayCount = 0;
  }

  if (w.dayCount >= RATE_LIMITS.perDay) {
    return { ok: false, scope: "day", retryAfterSec: Math.ceil((w.dayStart + DAY - now) / 1000) };
  }
  if (w.minuteCount >= RATE_LIMITS.perMinute) {
    return { ok: false, scope: "minute", retryAfterSec: Math.ceil((w.minuteStart + MINUTE - now) / 1000) };
  }
  w.minuteCount++;
  w.dayCount++;

  // Opportunistic cleanup so the map can't grow without bound.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (now - v.dayStart >= DAY) buckets.delete(k);
  }
  return { ok: true };
}

export function clientIp(headers: Headers) {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "local";
}
