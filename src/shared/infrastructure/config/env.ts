/**
 * The configuration read from the environment. It is read once, here, so a
 * missing variable fails with a clear message instead of a request to
 * "undefined/products".
 */
function required(name: string, value: string | undefined): string {
  if (value === undefined || value.length === 0) {
    throw new Error(`Missing environment variable ${name}. See .env.example.`);
  }
  return value.replace(/\/+$/, "");
}

export const env = {
  apiUrl: required("NEXT_PUBLIC_API_URL", process.env.NEXT_PUBLIC_API_URL),
  wompiPublicKey: process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY ?? "",
} as const;
