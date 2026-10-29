/**
 * ROI estimates for the calculator. Pure functions: every input is clamped to
 * its range (NaN falls back to the minimum), so results
 * are always finite numbers. These are illustrative estimates, not forecasts.
 */

export const RESPONSE_TIMES = [
  { minutes: 5, label: "5 minutes" },
  { minutes: 15, label: "15 minutes" },
  { minutes: 30, label: "30 minutes" },
  { minutes: 60, label: "1 hour" },
  { minutes: 240, label: "4 hours" },
  { minutes: 720, label: "12 hours" },
  { minutes: 1440, label: "24 hours" },
] as const;

export type ResponseMinutes = (typeof RESPONSE_TIMES)[number]["minutes"];

export interface RoiInputs {
  monthlyLeads: number;
  responseMinutes: number;
  /** % of leads that become site visits today. */
  visitRate: number;
  /** % of site visits that become bookings today. */
  bookingRate: number;
  /** Average property value in ₹. */
  propertyValue: number;
  /** Commission / margin earned per booking, % of property value. */
  commissionRate: number;
  teamSize: number;
  /** Hours per agent per day spent on repetitive replies. */
  repetitiveHours: number;
}

export interface RoiAssumptions {
  /** Relative uplift in visit rate from instant replies, e.g. 0.3 = +30%. */
  visitUplift: number;
  /** Share of after-hours leads recovered, 0–1. */
  afterHoursRecovery: number;
  /** Share of repetitive replies automated, 0–1. */
  automationShare: number;
}

export const INPUT_RANGES: Record<keyof RoiInputs, { min: number; max: number; step: number }> = {
  monthlyLeads: { min: 50, max: 5000, step: 50 },
  responseMinutes: { min: 5, max: 1440, step: 1 },
  visitRate: { min: 1, max: 30, step: 0.5 },
  bookingRate: { min: 1, max: 20, step: 0.5 },
  propertyValue: { min: 50_00_000, max: 20_00_00_000, step: 5_00_000 },
  commissionRate: { min: 1, max: 10, step: 0.5 },
  teamSize: { min: 1, max: 50, step: 1 },
  repetitiveHours: { min: 0, max: 6, step: 0.5 },
};

export const ASSUMPTION_RANGES: Record<keyof RoiAssumptions, { min: number; max: number; step: number }> = {
  visitUplift: { min: 0, max: 1, step: 0.05 },
  afterHoursRecovery: { min: 0, max: 1, step: 0.05 },
  automationShare: { min: 0, max: 1, step: 0.05 },
};

export const DEFAULT_INPUTS: RoiInputs = {
  monthlyLeads: 600,
  responseMinutes: 240,
  visitRate: 8,
  bookingRate: 10,
  propertyValue: 1_50_00_000,
  commissionRate: 2,
  teamSize: 6,
  repetitiveHours: 2.5,
};

export const DEFAULT_ASSUMPTIONS: RoiAssumptions = {
  visitUplift: 0.3,
  afterHoursRecovery: 0.25,
  automationShare: 0.6,
};

/** Fixed modelling constants, shown in the UI as part of the assumptions. */
export const MODEL_CONSTANTS = {
  /** Share of inquiries that arrive outside office hours. */
  afterHoursShare: 0.35,
  workingDaysPerMonth: 26,
} as const;

/** Clamp to [min, max]; NaN falls back to min, ±Infinity to the nearest bound. */
export function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function sanitizeInputs(raw: RoiInputs): RoiInputs {
  const out = {} as RoiInputs;
  for (const key of Object.keys(INPUT_RANGES) as (keyof RoiInputs)[]) {
    const { min, max } = INPUT_RANGES[key];
    out[key] = clamp(raw[key], min, max);
  }
  return out;
}

export function sanitizeAssumptions(raw: RoiAssumptions): RoiAssumptions {
  return {
    visitUplift: clamp(raw.visitUplift, 0, 1),
    afterHoursRecovery: clamp(raw.afterHoursRecovery, 0, 1),
    automationShare: clamp(raw.automationShare, 0, 1),
  };
}

/**
 * How much of the uplift applies given today's response time: teams that
 * already reply in 5 minutes gain less than teams that reply next day.
 */
export function responseFactor(minutes: number) {
  const m = clamp(minutes, 5, 1440);
  // 0.4 at 5 min, rising on a log scale to 1.0 at 12 h and beyond.
  const t = Math.log(m / 5) / Math.log(720 / 5);
  return Math.min(1, 0.4 + 0.6 * Math.max(0, t));
}

export interface RoiScenario {
  siteVisits: number;
  bookings: number;
  /** Monthly commission / margin in ₹. */
  revenue: number;
}

export interface RoiResult {
  before: RoiScenario;
  after: RoiScenario;
  extraSiteVisits: number;
  extraBookings: number;
  extraRevenue: number;
  hoursSavedPerMonth: number;
  /** Effective relative uplift after the response-time factor. */
  effectiveUplift: number;
}

export function calculateRoi(rawInputs: RoiInputs, rawAssumptions: RoiAssumptions = DEFAULT_ASSUMPTIONS): RoiResult {
  const i = sanitizeInputs(rawInputs);
  const a = sanitizeAssumptions(rawAssumptions);

  const visitRate = i.visitRate / 100;
  const bookingRate = i.bookingRate / 100;
  const revenuePerBooking = i.propertyValue * (i.commissionRate / 100);

  const effectiveUplift = a.visitUplift * responseFactor(i.responseMinutes);
  const improvedVisitRate = Math.min(1, visitRate * (1 + effectiveUplift));

  // After-hours leads that slipped away today and now get an instant reply.
  const recoveredLeads = i.monthlyLeads * MODEL_CONSTANTS.afterHoursShare * a.afterHoursRecovery;

  const beforeVisits = i.monthlyLeads * visitRate;
  const afterVisits = Math.min(i.monthlyLeads, i.monthlyLeads * improvedVisitRate + recoveredLeads * improvedVisitRate);

  const before: RoiScenario = {
    siteVisits: beforeVisits,
    bookings: beforeVisits * bookingRate,
    revenue: beforeVisits * bookingRate * revenuePerBooking,
  };
  const after: RoiScenario = {
    siteVisits: afterVisits,
    bookings: afterVisits * bookingRate,
    revenue: afterVisits * bookingRate * revenuePerBooking,
  };

  return {
    before,
    after,
    extraSiteVisits: after.siteVisits - before.siteVisits,
    extraBookings: after.bookings - before.bookings,
    extraRevenue: after.revenue - before.revenue,
    hoursSavedPerMonth: i.teamSize * i.repetitiveHours * a.automationShare * MODEL_CONSTANTS.workingDaysPerMonth,
    effectiveUplift,
  };
}

/* ------------------------------------------------------------------ */
/* Formatting (Indian numbering)                                       */
/* ------------------------------------------------------------------ */

const trim = (n: number, digits: number) => n.toFixed(digits).replace(/\.0+$|(\.\d*[1-9])0+$/, "$1");

/** ₹ with lakh/crore units: ₹1.85 Cr, ₹42.5 L, ₹85,000. */
export function formatINR(value: number, digits = 2) {
  const v = Number.isFinite(value) ? value : 0;
  const sign = v < 0 ? "-" : "";
  const abs = Math.abs(v);
  if (abs >= 1e7) return `${sign}₹${trim(abs / 1e7, digits)} Cr`;
  if (abs >= 1e5) return `${sign}₹${trim(abs / 1e5, digits)} L`;
  return `${sign}₹${Math.round(abs).toLocaleString("en-IN")}`;
}

/** Whole-number count with Indian grouping (1,24,500). */
export function formatCount(value: number) {
  return Math.round(Number.isFinite(value) ? value : 0).toLocaleString("en-IN");
}

/** One decimal under 10 so small numbers don't round to zero (0.6, 2.4, 18). */
export function formatSmall(value: number) {
  const v = Number.isFinite(value) ? value : 0;
  return Math.abs(v) < 10 ? trim(v, 1) : formatCount(v);
}
