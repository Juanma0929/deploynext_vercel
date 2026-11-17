"use client";

import { useContext } from "react";

import { AuthContext, type AuthState } from "./auth-provider";

/**
 * The facade the components use. They never reach the network, the container or
 * the context by hand: they ask this hook for the session and for the two
 * actions it allows.
 */
export function useAuth(): AuthState {
  const state = useContext(AuthContext);

  if (state === null) {
    throw new Error("useAuth solo funciona dentro de <AuthProvider>.");
  }

  return state;
}
