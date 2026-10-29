import { describe, expect, it } from "vitest";
import {
  calculateRoi,
  clamp,
  DEFAULT_ASSUMPTIONS,
  DEFAULT_INPUTS,
  formatINR,
  formatSmall,
  INPUT_RANGES,
  responseFactor,
  type RoiInputs,
  type RoiResult,
} from "./roi";

const allFinite = (r: RoiResult) =>
  [
    r.before.siteVisits,
    r.before.bookings,
    r.before.revenue,
    r.after.siteVisits,
    r.after.bookings,
    r.after.revenue,
    r.extraSiteVisits,
    r.extraBookings,
    r.extraRevenue,
    r.hoursSavedPerMonth,
    r.effectiveUplift,
  ].every(Number.isFinite);

describe("calculateRoi: typical inputs", () => {
  const r = calculateRoi(DEFAULT_INPUTS, DEFAULT_ASSUMPTIONS);

  it("computes the baseline from the visitor's own rates", () => {
    // 600 leads × 8% = 48 visits; × 10% = 4.8 bookings; × (₹1.5 Cr × 2% = ₹3 L) = ₹14.4 L.
    expect(r.before.siteVisits).toBeCloseTo(48);
    expect(r.before.bookings).toBeCloseTo(4.8);
    expect(r.before.revenue).toBeCloseTo(14_40_000);
  });

  it("projects more visits, bookings and revenue with instant replies", () => {
    expect(r.extraSiteVisits).toBeGreaterThan(0);
    expect(r.extraBookings).toBeCloseTo(r.extraSiteVisits * 0.1);
    expect(r.extraRevenue).toBeCloseTo(r.extraBookings * 1_50_00_000 * 0.02);
  });

  it("matches the documented model", () => {
    const uplift = 0.3 * responseFactor(240);
    const rate = 0.08 * (1 + uplift);
    const recovered = 600 * 0.35 * 0.25;
    expect(r.after.siteVisits).toBeCloseTo(600 * rate + recovered * rate);
  });

  it("saves team hours: 6 agents × 2.5 h × 60% × 26 days", () => {
    expect(r.hoursSavedPerMonth).toBeCloseTo(234);
  });

  it("gives slower teams a bigger uplift", () => {
    const fast = calculateRoi({ ...DEFAULT_INPUTS, responseMinutes: 5 });
    const slow = calculateRoi({ ...DEFAULT_INPUTS, responseMinutes: 1440 });
    expect(slow.extraSiteVisits).toBeGreaterThan(fast.extraSiteVisits);
  });
});

describe("calculateRoi: zero and edge inputs", () => {
  const zeros: RoiInputs = {
    monthlyLeads: 0,
    responseMinutes: 0,
    visitRate: 0,
    bookingRate: 0,
    propertyValue: 0,
    commissionRate: 0,
    teamSize: 0,
    repetitiveHours: 0,
  };

  it("clamps zeros to range minimums and stays finite", () => {
    const r = calculateRoi(zeros, DEFAULT_ASSUMPTIONS);
    expect(allFinite(r)).toBe(true);
    expect(r.before.siteVisits).toBeCloseTo(INPUT_RANGES.monthlyLeads.min * 0.01);
    expect(r.hoursSavedPerMonth).toBe(0); // 0 repetitive hours is a valid input
  });

  it("returns zero gains when every assumption is zero", () => {
    const r = calculateRoi(DEFAULT_INPUTS, { visitUplift: 0, afterHoursRecovery: 0, automationShare: 0 });
    expect(r.extraSiteVisits).toBeCloseTo(0);
    expect(r.extraRevenue).toBeCloseTo(0);
    expect(r.hoursSavedPerMonth).toBe(0);
  });

  it("treats NaN / Infinity / negative values as out of range", () => {
    const r = calculateRoi(
      { ...DEFAULT_INPUTS, monthlyLeads: Number.NaN, visitRate: Infinity, propertyValue: -5 },
      { visitUplift: Number.NaN, afterHoursRecovery: -1, automationShare: 9 },
    );
    expect(allFinite(r)).toBe(true);
    expect(r.before.siteVisits).toBeCloseTo(50 * 0.3); // NaN leads -> 50, Infinity rate -> 30%
  });
});

describe("calculateRoi: maximum inputs", () => {
  const max: RoiInputs = {
    monthlyLeads: 1e9,
    responseMinutes: 1e9,
    visitRate: 100,
    bookingRate: 100,
    propertyValue: 1e12,
    commissionRate: 100,
    teamSize: 1e6,
    repetitiveHours: 24,
  };
  const r = calculateRoi(max, { visitUplift: 5, afterHoursRecovery: 5, automationShare: 5 });

  it("clamps to range maximums", () => {
    expect(r.before.siteVisits).toBeCloseTo(5000 * 0.3);
    expect(r.hoursSavedPerMonth).toBeCloseTo(50 * 6 * 1 * 26);
  });

  it("never projects more visits than leads", () => {
    expect(r.after.siteVisits).toBeLessThanOrEqual(5000);
    expect(allFinite(r)).toBe(true);
  });
});

describe("helpers", () => {
  it("clamp handles non-finite values", () => {
    expect(clamp(Number.NaN, 1, 5)).toBe(1);
    expect(clamp(Infinity, 1, 5)).toBe(5);
    expect(clamp(-Infinity, 1, 5)).toBe(1);
    expect(clamp(10, 1, 5)).toBe(5);
  });

  it("responseFactor rises with slower replies and caps at 1", () => {
    expect(responseFactor(5)).toBeCloseTo(0.4);
    expect(responseFactor(720)).toBeCloseTo(1);
    expect(responseFactor(1440)).toBe(1);
    expect(responseFactor(60)).toBeGreaterThan(responseFactor(15));
  });

  it("formats rupees in lakh / crore", () => {
    expect(formatINR(1_85_00_000)).toBe("₹1.85 Cr");
    expect(formatINR(42_50_000)).toBe("₹42.5 L");
    expect(formatINR(85_000)).toBe("₹85,000");
    expect(formatINR(2_00_00_000)).toBe("₹2 Cr");
    expect(formatINR(Number.NaN)).toBe("₹0");
  });

  it("formats small counts with one decimal", () => {
    expect(formatSmall(0.6)).toBe("0.6");
    expect(formatSmall(2.0)).toBe("2");
    expect(formatSmall(1234.4)).toBe("1,234");
  });
});
