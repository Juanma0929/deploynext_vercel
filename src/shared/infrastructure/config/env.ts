/**
 * The configuration of the app, read from the environment.
 *
 * Every NEXT_PUBLIC_* variable must be written out literally: Next.js inlines
 * them at build time by searching for the exact expression.
 */
export function apiBaseUrl(): string {
  return required("NEXT_PUBLIC_API_URL", process.env.NEXT_PUBLIC_API_URL).replace(/\/+$/, "");
}

/** The public key of Wompi. Private keys never reach the frontend. */
export function wompiPublicKey(): string {
  return required("NEXT_PUBLIC_WOMPI_PUBLIC_KEY", process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY);
}

function required(name: string, value: string | undefined): string {
  if (value === undefined || value.trim() === "") {
    throw new Error(`${name} is not set. Copy .env.example to .env.local.`);
  }
  return value.trim();
}
