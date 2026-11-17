/**
 * The configuration of the app, read from the environment.
 *
 * Every NEXT_PUBLIC_* variable must be written out literally: Next.js inlines
 * them at build time by searching for the exact expression.
 */
export function apiBaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_API_URL;

  if (value === undefined || value.trim() === "") {
    throw new Error("NEXT_PUBLIC_API_URL is not set. Copy .env.example to .env.local.");
  }

  return value.trim().replace(/\/+$/, "");
}
