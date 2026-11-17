"use client";

import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { errorMessage } from "@/shared/domain/errors";
import { resetSessionState } from "@/shared/presentation/session-reset";

import { authContainer } from "../di/container";
import type { LoginCredentials } from "../domain/credentials";
import { InvalidTwoFactorCodeError, TwoFactorRequiredError } from "../domain/errors";
import type { User } from "../domain/user";

export type AuthState =
  | { readonly status: "loading" }
  | { readonly status: "anonymous" }
  | { readonly status: "authenticated"; readonly user: User };

/** What happened with one attempt to log in. */
export type LoginOutcome =
  | { readonly kind: "authenticated"; readonly user: User }
  | { readonly kind: "two-factor-required"; readonly message: string }
  | { readonly kind: "invalid-two-factor-code"; readonly message: string }
  | { readonly kind: "failed"; readonly message: string };

export interface AuthContextValue {
  readonly state: AuthState;
  readonly login: (credentials: LoginCredentials) => Promise<LoginOutcome>;
  /** Ends the session on every device and goes to /login. Never rejects. */
  readonly logout: () => Promise<void>;
}

const LOGIN_PATH = "/login";

export const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * The store of auth. It keeps the logged-in user in memory and, on a page
 * load with a stored token, asks the API for the profile to restore it.
 */
export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    let isCurrent = true;
    const { hasSession, getProfile } = authContainer();

    async function restore(): Promise<AuthState> {
      if (!(await hasSession.execute())) return { status: "anonymous" };
      try {
        return { status: "authenticated", user: await getProfile.execute() };
      } catch {
        // A 401 already cleared the token and is sending the user to /login.
        return { status: "anonymous" };
      }
    }

    void restore().then((next) => {
      if (isCurrent) setState(next);
    });

    return () => {
      isCurrent = false;
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<LoginOutcome> => {
    const container = authContainer();

    try {
      await container.login.execute(credentials);
    } catch (error: unknown) {
      if (error instanceof TwoFactorRequiredError) {
        return { kind: "two-factor-required", message: error.message };
      }
      if (error instanceof InvalidTwoFactorCodeError) {
        return { kind: "invalid-two-factor-code", message: error.message };
      }
      return { kind: "failed", message: errorMessage(error) };
    }

    try {
      const user = await container.getProfile.execute();
      setState({ status: "authenticated", user });
      return { kind: "authenticated", user };
    } catch (error: unknown) {
      // Without a profile there is no role to build the navigation with.
      await container.logoutLocally.execute();
      return { kind: "failed", message: errorMessage(error) };
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    // Clears the token and the cookie even if the request fails.
    await authContainer().logout.execute();

    setState({ status: "anonymous" });
    resetSessionState();

    // A full page load, not router.push: every in-memory store of every
    // feature starts over, and "back" does not return to a protected page.
    window.location.replace(LOGIN_PATH);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ state, login, logout }),
    [state, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
