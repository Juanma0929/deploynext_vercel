import { DateRange, isIsoDate } from "./date-range";
import { DomainError } from "./errors";

/** The API counts days in Colombian time, so the frontend does too. */
export const BUSINESS_TIME_ZONE = "America/Bogota";

const ISO_DAY_FORMAT = new Intl.DateTimeFormat("en-CA", {
  timeZone: BUSINESS_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Today in Colombia as YYYY-MM-DD, whatever the time zone of the browser. */
export function todayInColombia(now: Date): string {
  return ISO_DAY_FORMAT.format(now);
}

/** Moves a YYYY-MM-DD date by whole days, crossing months and years. */
export function addDays(date: string, days: number): string {
  if (!isIsoDate(date)) throw new DomainError("La fecha no es válida.");

  const [year, month, day] = date.split("-").map(Number) as [number, number, number];
  const moved = new Date(Date.UTC(year, month - 1, day + days));
  return moved.toISOString().slice(0, 10);
}

/** The last `days` days up to `today`, both ends included: lastDays(t, 7) is a week. */
export function lastDays(today: string, days: number): DateRange {
  if (!Number.isSafeInteger(days) || days < 1) {
    throw new DomainError("La cantidad de días debe ser un entero mayor que cero.");
  }
  return DateRange.create(addDays(today, -(days - 1)), today);
}

/**
 * The day in Colombia (YYYY-MM-DD) an instant falls on. A sale at 21:00 on
 * Monday in Colombia is already Tuesday in UTC; this says Monday.
 */
export function dayInColombia(instant: Date): string {
  return ISO_DAY_FORMAT.format(instant);
}

const HAS_TIME_ZONE = /(Z|[+-]\d{2}:?\d{2})$/i;

/**
 * Reads a timestamp the API sends in UTC. ISO strings with a zone are read
 * as they are; one without a zone is taken as UTC, because new Date() would
 * read it as the local time of the browser.
 */
export function parseUtcTimestamp(value: string): Date {
  const text = value.trim();
  const date = new Date(HAS_TIME_ZONE.test(text) ? text : `${text.replace(" ", "T")}Z`);
  if (Number.isNaN(date.getTime())) throw new DomainError("La fecha recibida no es válida.");
  return date;
}

/** The first day of the month of a YYYY-MM-DD date. */
export function startOfMonth(date: string): string {
  if (!isIsoDate(date)) throw new DomainError("La fecha no es válida.");
  return `${date.slice(0, 8)}01`;
}

/** From the 1st of the month of `today` to `today`, both included. */
export function monthToDate(today: string): DateRange {
  return DateRange.create(startOfMonth(today), today);
}

/** Every day of the range, in order, both ends included. */
export function daysOf(range: DateRange): string[] {
  const days: string[] = [];
  for (let day = range.from; day <= range.to; day = addDays(day, 1)) days.push(day);
  return days;
}
