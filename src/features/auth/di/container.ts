import { browserHttpClient, browserTokenStorage } from "@/shared/di/http";

import { GetProfileUseCase } from "../application/get-profile.use-case";
import { HasSessionUseCase } from "../application/has-session.use-case";
import { LoginUseCase } from "../application/login.use-case";
import { LogoutLocallyUseCase } from "../application/logout-locally.use-case";
import { LogoutUseCase } from "../application/logout.use-case";
import { WakeUpServer } from "../application/wake-up-server";
import { AuthHttpRepository } from "../infrastructure/auth.http.repository";
import { ServerStatusHttpRepository } from "../infrastructure/server-status.http.repository";

export interface AuthContainer {
  readonly wakeUpServer: WakeUpServer;
  readonly login: LoginUseCase;
  readonly getProfile: GetProfileUseCase;
  readonly hasSession: HasSessionUseCase;
  readonly logoutLocally: LogoutLocallyUseCase;
  readonly logout: LogoutUseCase;
}

let container: AuthContainer | null = null;

/** The use cases of auth for the browser, wired once. */
export function authContainer(): AuthContainer {
  if (container !== null) return container;

  const http = browserHttpClient();
  const tokenStore = browserTokenStorage();
  const authRepository = new AuthHttpRepository(http);

  container = {
    wakeUpServer: new WakeUpServer(new ServerStatusHttpRepository(http)),
    login: new LoginUseCase(authRepository, tokenStore),
    getProfile: new GetProfileUseCase(authRepository),
    hasSession: new HasSessionUseCase(tokenStore),
    logoutLocally: new LogoutLocallyUseCase(tokenStore),
    logout: new LogoutUseCase(authRepository, tokenStore),
  };
  return container;
}
