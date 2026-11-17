import type { SessionTokenStore } from "@/shared/domain/session-token-store";

import { AuthenticatedUser } from "../domain/authenticated-user";
import type { AuthRepository } from "../domain/auth.repository";
import type { Credentials } from "../domain/credentials";

/**
 * The fakes the unit tests use instead of the network, as the statement asks:
 * the use cases are tested against the ports, never against fetch.
 */
export class InMemoryTokenStore implements SessionTokenStore {
  constructor(private token: string | null = null) {}

  async read(): Promise<string | null> {
    return this.token;
  }

  async save(token: string): Promise<void> {
    this.token = token;
  }

  async clear(): Promise<void> {
    this.token = null;
  }
}

interface FakeAuthOptions {
  readonly token?: string;
  readonly user?: AuthenticatedUser;
  readonly loginFails?: Error;
  readonly profileFails?: Error;
  readonly logoutFails?: Error;
}

export const adminUser = new AuthenticatedUser({
  id: "u-1",
  name: "Ana Admin",
  email: "admin@stockpyme.com",
  role: "admin",
  isActive: true,
  isTwoFactorEnabled: false,
});

export const sellerUser = new AuthenticatedUser({
  id: "u-2",
  name: "Beto Vendedor",
  email: "seller@stockpyme.com",
  role: "seller",
  isActive: true,
  isTwoFactorEnabled: false,
});

export class FakeAuthRepository implements AuthRepository {
  readonly calls: { login: Credentials[]; profile: number; logout: number } = {
    login: [],
    profile: 0,
    logout: 0,
  };

  constructor(private readonly options: FakeAuthOptions = {}) {}

  async login(credentials: Credentials): Promise<string> {
    this.calls.login.push(credentials);
    if (this.options.loginFails !== undefined) throw this.options.loginFails;
    return this.options.token ?? "jwt-123";
  }

  async profile(): Promise<AuthenticatedUser> {
    this.calls.profile += 1;
    if (this.options.profileFails !== undefined) throw this.options.profileFails;
    return this.options.user ?? adminUser;
  }

  async logout(): Promise<void> {
    this.calls.logout += 1;
    if (this.options.logoutFails !== undefined) throw this.options.logoutFails;
  }
}
