import { browserHttpClient } from "@/shared/di/http";

import { WakeUpServer } from "../application/wake-up-server";
import { ServerStatusHttpRepository } from "../infrastructure/server-status.http.repository";

export interface AuthContainer {
  readonly wakeUpServer: WakeUpServer;
}

let container: AuthContainer | null = null;

/** The use cases of auth for the browser, wired once. */
export function authContainer(): AuthContainer {
  container ??= {
    wakeUpServer: new WakeUpServer(new ServerStatusHttpRepository(browserHttpClient())),
  };
  return container;
}
