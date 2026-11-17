import { DomainError } from "./errors";

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Whether the value is a calendar date written as YYYY-MM-DD that really
 * exists: 2026-02-30 has the right shape but is rejected.
 */
export function isIsoDate(value: string): boolean {
  const match = ISO_DATE.exec(value);
  if (match === null) return false;

  const [, year, month, day] = match.map(Number);
  if (year === undefined || month === undefined || day === undefined) return false;

  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

/**
 * A range of whole days, both ends included, as the reports of the API expect.
 *
 * The dates stay as YYYY-MM-DD strings: they are calendar days, not instants,
 * so they never go through a time zone. In that format, comparing the strings
 * compares the dates.
 */
export class DateRange {
  private constructor(
    readonly from: string,
    readonly to: string,
  ) {}

  static create(from: string, to: string): DateRange {
    if (!isIsoDate(from)) {
      throw new DomainError("La fecha inicial no es válida. Usa el formato AAAA-MM-DD.");
    }
    if (!isIsoDate(to)) {
      throw new DomainError("La fecha final no es válida. Usa el formato AAAA-MM-DD.");
    }
    if (from > to) {
      throw new DomainError("La fecha inicial no puede ser posterior a la final.");
    }
    return new DateRange(from, to);
  }

  /** A range of a single day. */
  static day(date: string): DateRange {
    return DateRange.create(date, date);
  }

  includes(date: string): boolean {
    return date >= this.from && date <= this.to;
  }

  equals(other: DateRange): boolean {
    return this.from === other.from && this.to === other.to;
  }
}
