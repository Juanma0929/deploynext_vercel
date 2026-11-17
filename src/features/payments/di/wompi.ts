import { wompiPublicKey } from "@/shared/infrastructure/config/env";

import { WompiClient } from "../infrastructure/wompi-client";

let client: WompiClient | null = null;

/** The only place the Wompi client is created, with the public key. */
export function wompiClient(): WompiClient {
  client ??= new WompiClient(wompiPublicKey());
  return client;
}
