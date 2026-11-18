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
