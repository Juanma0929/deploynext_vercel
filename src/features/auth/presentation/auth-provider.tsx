"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useMemo, useState, type ReactNode } from "react";

import type { LoginInput } from "../application/login-user";
import { authContainer } from "../di/container";
import {
  AuthenticatedUser,
  type AuthenticatedUserSnapshot,
} from "../domain/authenticated-user";
import type { Role } from "../domain/role";

export interface AuthState {
  readonly user: AuthenticatedUser | null;
  readonly isAuthenticated: boolean;
  readonly isAdmin: boolean;
  readonly isWorking: boolean;
  readonly login: (input: LoginInput) => Promise<void>;
  readonly logout: () => Promise<void>;
  readonly hasAnyRole: (roles: readonly Role[]) => boolean;
}

export const AuthContext = createContext<AuthState | null>(null);

interface AuthProviderProps {
  readonly children: ReactNode;
  /** The session the server already resolved, so the first paint knows the user. */
  readonly initialUser: AuthenticatedUserSnapshot | null;
}

/**
 * The centralised state of the session. It holds the user and talks to the use
 * cases through the container; the components only see the facade hook.
 *
 * It is seeded with the session the server resolved, so there is no flash of
 * "not logged in" while the browser checks, and no second request on load.
 */
export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const router = useRouter();
  const [user, setUser] = useState<AuthenticatedUser | null>(() =>
    initialUser === null ? null : AuthenticatedUser.fromSnapshot(initialUser),
  );
  const [isWorking, setIsWorking] = useState(false);

  const login = useCallback(
    async (input: LoginInput) => {
      setIsWorking(true);
      try {
        setUser(await authContainer().loginUser.execute(input));
        // refresh() re-runs the Server Components, so the protected layout
        // reads the new cookie and renders the navigation for the role.
        router.replace("/dashboard");
        router.refresh();
      } finally {
        setIsWorking(false);
      }
    },
    [router],
  );

  const logout = useCallback(async () => {
    setIsWorking(true);
    try {
      await authContainer().logoutUser.execute();
    } finally {
      setUser(null);
      setIsWorking(false);
      router.replace("/login");
      router.refresh();
    }
  }, [router]);

  const value = useMemo<AuthState>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isAdmin: user?.isAdmin() ?? false,
      isWorking,
      login,
      logout,
      hasAnyRole: (roles) => user?.hasAnyRole(roles) ?? false,
    }),
    [user, isWorking, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
