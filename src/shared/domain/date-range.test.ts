import { describe, expect, it } from "vitest";

import { DateRange, isIsoDate } from "./date-range";
import { DomainError } from "./errors";

describe("isIsoDate", () => {
  it("accepts real days written as YYYY-MM-DD", () => {
    expect(isIsoDate("2026-11-17")).toBe(true);
    expect(isIsoDate("2028-02-29")).toBe(true); // leap year
  });

  it("refuses days that do not exist and other formats", () => {
    expect(isIsoDate("2026-02-30")).toBe(false);
    expect(isIsoDate("2026-02-29")).toBe(false); // not a leap year
    expect(isIsoDate("2026-13-01")).toBe(false);
    expect(isIsoDate("17/11/2026")).toBe(false);
    expect(isIsoDate("2026-1-5")).toBe(false);
    expect(isIsoDate("")).toBe(false);
  });
});

describe("DateRange", () => {
  it("keeps both ends as calendar days", () => {
    const range = DateRange.create("2026-11-01", "2026-11-30");
    expect(range.from).toBe("2026-11-01");
    expect(range.to).toBe("2026-11-30");
  });

  it("refuses an invalid start or end", () => {
    expect(() => DateRange.create("2026-02-30", "2026-03-01")).toThrow("La fecha inicial no es válida");
    expect(() => DateRange.create("2026-03-01", "mañana")).toThrow("La fecha final no es válida");
  });

  it("refuses a start after the end", () => {
    expect(() => DateRange.create("2026-11-30", "2026-11-01")).toThrow(DomainError);
  });

  it("can be a single day", () => {
    const day = DateRange.day("2026-11-17");
    expect(day.from).toBe(day.to);
    expect(day.equals(DateRange.create("2026-11-17", "2026-11-17"))).toBe(true);
  });

  it("includes both ends and nothing outside", () => {
    const range = DateRange.create("2026-11-01", "2026-11-30");
    expect(range.includes("2026-11-01")).toBe(true);
    expect(range.includes("2026-11-30")).toBe(true);
    expect(range.includes("2026-11-15")).toBe(true);
    expect(range.includes("2026-10-31")).toBe(false);
    expect(range.includes("2026-12-01")).toBe(false);
  });

  it("compares by its ends", () => {
    const range = DateRange.create("2026-11-01", "2026-11-30");
    expect(range.equals(DateRange.create("2026-11-01", "2026-11-30"))).toBe(true);
    expect(range.equals(DateRange.create("2026-11-01", "2026-11-29"))).toBe(false);
  });
});
