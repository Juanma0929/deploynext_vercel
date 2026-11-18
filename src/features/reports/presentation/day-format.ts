/**
 * Formats a YYYY-MM-DD calendar day. The day is built at noon UTC and shown
 * in UTC, so no time zone can move it to the day before.
 */
function toNoonUtc(day: string): Date {
  return new Date(`${day}T12:00:00Z`);
}

const SHORT = new Intl.DateTimeFormat("es-CO", { timeZone: "UTC", day: "numeric", month: "short" });
const LONG = new Intl.DateTimeFormat("es-CO", {
  timeZone: "UTC",
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** "3 nov." */
export function shortDay(day: string): string {
  return SHORT.format(toNoonUtc(day));
}

/** "lunes, 3 de noviembre de 2026" */
export function longDay(day: string): string {
  return LONG.format(toNoonUtc(day));
}
